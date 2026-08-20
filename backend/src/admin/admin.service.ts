import { Injectable, NotFoundException } from '@nestjs/common';
import { StatutDepot, StatutConsigne, StatutPlainte } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DepotsAdminQueryDto } from './dto/depots-admin-query.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      depotsActifs,
      depotsEnAttente,
      ventes,
      consignes,
      plaintesEnAttente,
    ] = await Promise.all([
      this.prisma.depot.count({ where: { statut: StatutDepot.VALIDE } }),
      this.prisma.depot.count({ where: { statut: StatutDepot.EN_ATTENTE } }),
      this.prisma.commande.aggregate({ _sum: { montantTotal: true } }),
      this.prisma.consigne.aggregate({
        where: { statut: StatutConsigne.BLOQUEE },
        _sum: { montant: true },
      }),
      this.prisma.plainte.count({ where: { statut: StatutPlainte.EN_ATTENTE } }),
    ]);

    return {
      depotsActifs,
      depotsEnAttente,
      chiffreAffairesTotal: ventes._sum.montantTotal ?? 0,
      consignesActives: consignes._sum.montant ?? 0,
      plaintesEnAttente,
    };
  }

  getDepots(query: DepotsAdminQueryDto) {
    return this.prisma.depot.findMany({
      where: query.statut ? { statut: query.statut } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async validerDepot(id: string) {
    await this.requireDepot(id);
    return this.prisma.depot.update({ where: { id }, data: { statut: StatutDepot.VALIDE } });
  }

  async bloquerDepot(id: string) {
    await this.requireDepot(id);
    return this.prisma.depot.update({ where: { id }, data: { statut: StatutDepot.BLOQUE } });
  }

  private async requireDepot(id: string) {
    const depot = await this.prisma.depot.findUnique({ where: { id } });
    if (!depot) {
      throw new NotFoundException('Dépôt introuvable.');
    }
    return depot;
  }
}
