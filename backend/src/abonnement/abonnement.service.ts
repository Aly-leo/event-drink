import { Injectable, NotFoundException } from '@nestjs/common';
import { PalierAbonnement, Prisma, StatutAbonnement, StatutPaiement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreerPaiementAbonnementDto } from './dto/creer-paiement-abonnement.dto';

const PRIX_PALIER: Record<PalierAbonnement, number> = {
  STANDARD: 5000,
  PREMIUM: 10000,
};

const DUREE_ABONNEMENT_JOURS = 30;

function genReference(): string {
  const year = new Date().getFullYear();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `PAY-${year}-${suffix}`;
}

@Injectable()
export class AbonnementService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateMyAbonnement(ownerId: string) {
    const depot = await this.requireMyDepot(ownerId);
    const existing = await this.prisma.abonnement.findUnique({ where: { depotId: depot.id } });
    if (existing) {
      return existing;
    }

    return this.prisma.abonnement.create({
      data: {
        depotId: depot.id,
        palier: PalierAbonnement.STANDARD,
        statut: StatutAbonnement.ACTIF,
        dateRenouvellement: this.dansNJours(DUREE_ABONNEMENT_JOURS),
      },
    });
  }

  async payer(ownerId: string, dto: CreerPaiementAbonnementDto) {
    const depot = await this.requireMyDepot(ownerId);
    const abonnement = await this.findOrCreateMyAbonnement(ownerId);
    const montant = PRIX_PALIER[dto.palier];

    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const [paiement, abonnementMaJ] = await this.prisma.$transaction([
          this.prisma.paiementAbonnement.create({
            data: {
              abonnementId: abonnement.id,
              palier: dto.palier,
              montant,
              operateur: dto.operateur,
              numeroTelephone: dto.numeroTelephone,
              statut: StatutPaiement.REUSSI,
              reference: genReference(),
            },
          }),
          this.prisma.abonnement.update({
            where: { id: abonnement.id },
            data: {
              palier: dto.palier,
              statut: StatutAbonnement.ACTIF,
              dateRenouvellement: this.dansNJours(DUREE_ABONNEMENT_JOURS),
            },
          }),
        ]);

        return { abonnement: abonnementMaJ, paiement };
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          continue;
        }
        throw e;
      }
    }
    throw new Error('Impossible de générer une référence de paiement unique, réessaie.');
  }

  async findMesPaiements(ownerId: string) {
    const depot = await this.requireMyDepot(ownerId);
    const abonnement = await this.prisma.abonnement.findUnique({ where: { depotId: depot.id } });
    if (!abonnement) {
      return [];
    }
    return this.prisma.paiementAbonnement.findMany({
      where: { abonnementId: abonnement.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  private dansNJours(jours: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + jours);
    return date;
  }

  private async requireMyDepot(ownerId: string) {
    const depot = await this.prisma.depot.findUnique({ where: { ownerId } });
    if (!depot) {
      throw new NotFoundException('Aucun dépôt associé à ce compte.');
    }
    return depot;
  }
}
