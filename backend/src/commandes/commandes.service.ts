import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ModeReception, Prisma, Role, StatutCommande, StatutDepot } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommandeDto } from './dto/create-commande.dto';

const INCLUDE_FULL = {
  depot: { select: { id: true, nomCommerce: true, telephone: true, adresse: true } },
  client: { select: { id: true, nom: true, telephone: true } },
  lignes: {
    include: {
      produitDepot: { include: { produit: true } },
      consigne: true,
    },
  },
  avis: true,
};

const TRANSITIONS: Record<ModeReception, StatutCommande[]> = {
  RETRAIT: [
    StatutCommande.EN_ATTENTE,
    StatutCommande.CONFIRMEE,
    StatutCommande.PRETE_A_RETIRER,
    StatutCommande.TERMINEE,
  ],
  LIVRAISON: [
    StatutCommande.EN_ATTENTE,
    StatutCommande.CONFIRMEE,
    StatutCommande.EN_PREPARATION,
    StatutCommande.EN_ROUTE,
    StatutCommande.LIVREE,
  ],
};

function genReference(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `FAC-${year}-${suffix}`;
}

@Injectable()
export class CommandesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clientId: string, dto: CreateCommandeDto) {
    const depot = await this.prisma.depot.findUnique({ where: { id: dto.depotId } });
    if (!depot || depot.statut !== StatutDepot.VALIDE) {
      throw new NotFoundException('Dépôt introuvable ou non disponible.');
    }
    if (dto.mode === ModeReception.LIVRAISON && !depot.modeLivraison) {
      throw new BadRequestException('Ce dépôt ne propose pas la livraison.');
    }
    if (dto.mode === ModeReception.RETRAIT && !depot.modeRetrait) {
      throw new BadRequestException('Ce dépôt ne propose pas le retrait.');
    }
    if (dto.mode === ModeReception.LIVRAISON && !dto.adresseLivraison?.trim()) {
      throw new BadRequestException('Adresse de livraison requise.');
    }

    const produitDepotIds = dto.lignes.map((l) => l.produitDepotId);
    const produitsDepot = await this.prisma.produitDepot.findMany({
      where: { id: { in: produitDepotIds } },
    });

    const lignesResolues = dto.lignes.map((ligne) => {
      const pd = produitsDepot.find((p) => p.id === ligne.produitDepotId);
      if (!pd || pd.depotId !== dto.depotId || !pd.disponible) {
        throw new BadRequestException(`Produit indisponible chez ce dépôt : ${ligne.produitDepotId}`);
      }
      return {
        produitDepotId: pd.id,
        quantite: ligne.quantite,
        prixUnitaire: pd.prix,
        montantConsigneUnitaire: pd.montantConsigne,
      };
    });

    const fraisLivraison = dto.mode === ModeReception.LIVRAISON ? depot.fraisLivraison : 0;
    const montantTotal =
      lignesResolues.reduce((sum, l) => sum + l.quantite * (l.prixUnitaire + l.montantConsigneUnitaire), 0) +
      fraisLivraison;

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const commande = await this.prisma.$transaction(async (tx) => {
          const created = await tx.commande.create({
            data: {
              clientId,
              depotId: dto.depotId,
              mode: dto.mode,
              montantTotal,
              fraisLivraison,
              referenceUnique: genReference(),
              adresseLivraison: dto.adresseLivraison,
              instructions: dto.instructions,
              lignes: { create: lignesResolues },
            },
            include: { lignes: true },
          });

          for (const ligne of created.lignes) {
            if (ligne.montantConsigneUnitaire > 0) {
              await tx.consigne.create({
                data: {
                  ligneCommandeId: ligne.id,
                  montant: ligne.montantConsigneUnitaire * ligne.quantite,
                },
              });
            }
          }

          return created;
        });

        return this.findByIdRaw(commande.id);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          continue;
        }
        throw e;
      }
    }
    throw new BadRequestException('Impossible de générer une référence de commande unique, réessaie.');
  }

  findMine(clientId: string) {
    return this.prisma.commande.findMany({
      where: { clientId },
      include: INCLUDE_FULL,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findForMyDepot(ownerId: string) {
    const depot = await this.prisma.depot.findUnique({ where: { ownerId } });
    if (!depot) {
      throw new NotFoundException('Aucun dépôt associé à ce compte.');
    }
    return this.prisma.commande.findMany({
      where: { depotId: depot.id },
      include: INCLUDE_FULL,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, role: Role, id: string) {
    const commande = await this.findByIdRaw(id);
    if (!commande) {
      throw new NotFoundException('Commande introuvable.');
    }

    if (role === Role.ADMIN) {
      return commande;
    }
    if (role === Role.CLIENT && commande.clientId === userId) {
      return commande;
    }
    if (role === Role.DEPOT) {
      const depot = await this.prisma.depot.findUnique({ where: { ownerId: userId } });
      if (depot && depot.id === commande.depotId) {
        return commande;
      }
    }

    throw new NotFoundException('Commande introuvable.');
  }

  async updateStatut(ownerId: string, id: string, statut: StatutCommande) {
    const depot = await this.prisma.depot.findUnique({ where: { ownerId } });
    if (!depot) {
      throw new NotFoundException('Aucun dépôt associé à ce compte.');
    }
    const commande = await this.prisma.commande.findUnique({ where: { id } });
    if (!commande || commande.depotId !== depot.id) {
      throw new NotFoundException('Commande introuvable.');
    }

    const sequence = TRANSITIONS[commande.mode];
    const currentIndex = sequence.indexOf(commande.statut);
    const nextIndex = sequence.indexOf(statut);
    if (nextIndex === -1 || nextIndex !== currentIndex + 1) {
      throw new BadRequestException(
        `Transition invalide : ${commande.statut} -> ${statut} pour le mode ${commande.mode}.`
      );
    }

    return this.prisma.commande.update({
      where: { id },
      data: { statut },
      include: INCLUDE_FULL,
    });
  }

  private findByIdRaw(id: string) {
    return this.prisma.commande.findUnique({ where: { id }, include: INCLUDE_FULL });
  }
}
