import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatutDepot } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DepotsQueryDto } from './dto/depots-query.dto';
import { AddProduitDepotDto } from './dto/add-produit-depot.dto';
import { UpdateProduitDepotDto } from './dto/update-produit-depot.dto';

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

  private async requireMyDepot(ownerId: string) {
    const depot = await this.findMyDepot(ownerId);
    if (!depot) {
      throw new NotFoundException('Aucun dépôt associé à ce compte.');
    }
    return depot;
  }
}
