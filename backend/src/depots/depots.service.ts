import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatutCommande, StatutDepot, TypeMouvementStock } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DepotsQueryDto } from './dto/depots-query.dto';
import { AddProduitDepotDto } from './dto/add-produit-depot.dto';
import { UpdateProduitDepotDto } from './dto/update-produit-depot.dto';
import { CreateMyDepotDto } from './dto/create-my-depot.dto';
import { UpdateMyDepotDto } from './dto/update-my-depot.dto';
import { CreateMouvementStockDto } from './dto/create-mouvement-stock.dto';
import { StatistiquesQueryDto } from './dto/statistiques-query.dto';

const STATUTS_VENTE_REALISEE: StatutCommande[] = [StatutCommande.TERMINEE, StatutCommande.LIVREE];

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

@Injectable()
export class DepotsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: DepotsQueryDto) {
    const depots = await this.prisma.depot.findMany({
      where: { statut: StatutDepot.VALIDE },
    });

    const avisParDepot = await this.avisAgregesParDepot(depots.map((d) => d.id));

    const withDistance = depots.map((depot) => ({
      ...depot,
      ...avisParDepot(depot.id),
      distanceKm:
        query.lat !== undefined && query.lng !== undefined
          ? Math.round(distanceKm(query.lat, query.lng, depot.latitude, depot.longitude) * 10) / 10
          : null,
    }));

    const filtered =
      query.rayonKm !== undefined
        ? withDistance.filter((d) => d.distanceKm !== null && d.distanceKm <= query.rayonKm!)
        : withDistance;

    if (query.tri === 'distance' || (query.lat !== undefined && query.lng !== undefined)) {
      filtered.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    return filtered;
  }

  async findOne(id: string) {
    const depot = await this.prisma.depot.findUnique({
      where: { id },
      include: { produits: { include: { produit: true } } },
    });
    if (!depot) {
      throw new NotFoundException('Dépôt introuvable.');
    }

    const [avis, avisParDepot] = await Promise.all([
      this.prisma.avis.findMany({
        where: { depotId: id },
        include: { client: { select: { nom: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.avisAgregesParDepot([id]),
    ]);

    return { ...depot, ...avisParDepot(id), avis };
  }

  /** Renvoie une fonction (depotId) -> { noteMoyenne, nombreAvis }, une seule requete groupee (pas de N+1). */
  private async avisAgregesParDepot(depotIds: string[]) {
    if (depotIds.length === 0) {
      return () => ({ noteMoyenne: null, nombreAvis: 0 });
    }
    const groupes = await this.prisma.avis.groupBy({
      by: ['depotId'],
      where: { depotId: { in: depotIds } },
      _avg: { note: true },
      _count: { note: true },
    });
    const parId = new Map(
      groupes.map((g) => [
        g.depotId,
        { noteMoyenne: Math.round((g._avg.note ?? 0) * 10) / 10, nombreAvis: g._count.note },
      ])
    );
    return (depotId: string) => parId.get(depotId) ?? { noteMoyenne: null, nombreAvis: 0 };
  }

  findMyDepot(ownerId: string) {
    return this.prisma.depot.findUnique({ where: { ownerId } });
  }

  async createMyDepot(ownerId: string, dto: CreateMyDepotDto) {
    const existing = await this.findMyDepot(ownerId);
    if (existing) {
      throw new ConflictException('Vous avez déjà un dépôt enregistré.');
    }
    return this.prisma.depot.create({
      data: {
        ownerId,
        nomCommerce: dto.nomCommerce,
        telephone: dto.telephone,
        adresse: dto.adresse,
        latitude: dto.latitude,
        longitude: dto.longitude,
        modeLivraison: dto.modeLivraison ?? false,
        modeRetrait: dto.modeRetrait ?? true,
        fraisLivraison: dto.fraisLivraison ?? 0,
      },
    });
  }

  async updateMyDepot(ownerId: string, dto: UpdateMyDepotDto) {
    const depot = await this.requireMyDepot(ownerId);
    return this.prisma.depot.update({ where: { id: depot.id }, data: dto });
  }

  async findMyProduits(ownerId: string) {
    const depot = await this.requireMyDepot(ownerId);
    return this.prisma.produitDepot.findMany({
      where: { depotId: depot.id },
      include: { produit: true },
    });
  }

  async addMyProduit(ownerId: string, dto: AddProduitDepotDto) {
    const depot = await this.requireMyDepot(ownerId);
    try {
      return await this.prisma.produitDepot.create({
        data: {
          depotId: depot.id,
          produitId: dto.produitId,
          prix: dto.prix,
          montantConsigne: dto.montantConsigne ?? 0,
          disponible: dto.disponible ?? true,
          quantiteStock: dto.quantiteStock ?? 0,
          seuilAlerte: dto.seuilAlerte ?? 5,
        },
        include: { produit: true },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Ce produit est déjà dans votre catalogue.');
      }
      throw e;
    }
  }

  async updateMyProduit(ownerId: string, produitDepotId: string, dto: UpdateProduitDepotDto) {
    const depot = await this.requireMyDepot(ownerId);
    const produitDepot = await this.prisma.produitDepot.findUnique({
      where: { id: produitDepotId },
    });
    if (!produitDepot || produitDepot.depotId !== depot.id) {
      throw new NotFoundException("Entrée de catalogue introuvable pour votre dépôt.");
    }
    return this.prisma.produitDepot.update({
      where: { id: produitDepotId },
      data: dto,
      include: { produit: true },
    });
  }

  async creerMouvement(ownerId: string, produitDepotId: string, dto: CreateMouvementStockDto) {
    const depot = await this.requireMyDepot(ownerId);
    const produitDepot = await this.prisma.produitDepot.findUnique({ where: { id: produitDepotId } });
    if (!produitDepot || produitDepot.depotId !== depot.id) {
      throw new NotFoundException("Entrée de catalogue introuvable pour votre dépôt.");
    }

    const delta = dto.type === TypeMouvementStock.ENTREE ? dto.quantite : -dto.quantite;
    const nouvelleQuantite = Math.max(0, produitDepot.quantiteStock + delta);

    const [produitDepotMaJ, mouvement] = await this.prisma.$transaction([
      this.prisma.produitDepot.update({
        where: { id: produitDepotId },
        data: { quantiteStock: nouvelleQuantite },
        include: { produit: true },
      }),
      this.prisma.mouvementStock.create({
        data: {
          produitDepotId,
          type: dto.type,
          quantite: dto.quantite,
          motif: dto.motif,
        },
        include: { produitDepot: { include: { produit: true } } },
      }),
    ]);

    return { produitDepot: produitDepotMaJ, mouvement };
  }

  async findMesMouvements(ownerId: string) {
    const depot = await this.requireMyDepot(ownerId);
    return this.prisma.mouvementStock.findMany({
      where: { produitDepot: { depotId: depot.id } },
      include: { produitDepot: { include: { produit: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStatistiques(ownerId: string, query: StatistiquesQueryDto) {
    const depot = await this.requireMyDepot(ownerId);
    const jours = query.jours ?? 30;

    const maintenant = new Date();
    const debutActuelle = this.ilYA(jours);
    const debutPrecedente = this.ilYA(jours * 2);

    const commandes = await this.prisma.commande.findMany({
      where: { depotId: depot.id, createdAt: { gte: debutPrecedente, lte: maintenant } },
      include: {
        lignes: { include: { produitDepot: { include: { produit: true } } } },
      },
    });

    const ventesRealisees = commandes.filter((c) => STATUTS_VENTE_REALISEE.includes(c.statut));
    const periodeActuelle = ventesRealisees.filter((c) => c.createdAt >= debutActuelle);
    const periodePrecedente = ventesRealisees.filter((c) => c.createdAt < debutActuelle);

    const chiffreAffairesTotal = periodeActuelle.reduce((somme, c) => somme + c.montantTotal, 0);
    const chiffreAffairesPrecedent = periodePrecedente.reduce((somme, c) => somme + c.montantTotal, 0);
    const commandesTotal = periodeActuelle.length;
    const panierMoyen = commandesTotal > 0 ? Math.round(chiffreAffairesTotal / commandesTotal) : 0;
    const croissance =
      chiffreAffairesPrecedent > 0
        ? Math.round(((chiffreAffairesTotal - chiffreAffairesPrecedent) / chiffreAffairesPrecedent) * 1000) / 10
        : chiffreAffairesTotal > 0
          ? 100
          : 0;

    // Evolution du CA jour par jour (jours sans vente inclus a 0, pour une courbe continue).
    const caParJour = new Map<string, number>();
    for (let i = jours - 1; i >= 0; i--) {
      const jour = this.ilYA(i);
      caParJour.set(this.cleJour(jour), 0);
    }
    for (const commande of periodeActuelle) {
      const cle = this.cleJour(commande.createdAt);
      caParJour.set(cle, (caParJour.get(cle) ?? 0) + commande.montantTotal);
    }
    const evolution = {
      labels: [...caParJour.keys()].map((cle) => this.labelJour(cle)),
      valeurs: [...caParJour.values()],
    };

    // Repartition du CA par categorie de produit.
    const caParCategorie = new Map<string, number>();
    const ventesParProduit = new Map<string, { nom: string; quantiteVendue: number; chiffreAffaires: number }>();
    for (const commande of periodeActuelle) {
      for (const ligne of commande.lignes) {
        const produit = ligne.produitDepot.produit;
        const revenuLigne = ligne.quantite * ligne.prixUnitaire;

        caParCategorie.set(produit.categorie, (caParCategorie.get(produit.categorie) ?? 0) + revenuLigne);

        const existant = ventesParProduit.get(produit.id);
        if (existant) {
          existant.quantiteVendue += ligne.quantite;
          existant.chiffreAffaires += revenuLigne;
        } else {
          ventesParProduit.set(produit.id, { nom: produit.nom, quantiteVendue: ligne.quantite, chiffreAffaires: revenuLigne });
        }
      }
    }

    const totalCategories = [...caParCategorie.values()].reduce((s, v) => s + v, 0);
    const repartitionCategories = {
      labels: [...caParCategorie.keys()],
      valeurs: [...caParCategorie.values()].map((v) => (totalCategories > 0 ? Math.round((v / totalCategories) * 1000) / 10 : 0)),
    };

    const topProduits = [...ventesParProduit.values()]
      .sort((a, b) => b.quantiteVendue - a.quantiteVendue)
      .slice(0, 5);

    return {
      kpis: { chiffreAffairesTotal, commandesTotal, panierMoyen, croissance },
      evolution,
      repartitionCategories,
      topProduits,
    };
  }

  private ilYA(jours: number): Date {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - jours);
    return date;
  }

  private cleJour(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private labelJour(cleJour: string): string {
    const [annee, mois, jour] = cleJour.split('-').map(Number);
    return new Date(annee, mois - 1, jour).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }

  private async requireMyDepot(ownerId: string) {
    const depot = await this.findMyDepot(ownerId);
    if (!depot) {
      throw new NotFoundException('Aucun dépôt associé à ce compte.');
    }
    return depot;
  }
}
