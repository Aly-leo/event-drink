import { Injectable, NotFoundException } from '@nestjs/common';
import { ActionAdminPlainte, StatutDepot, StatutPlainte } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlainteDto } from './dto/create-plainte.dto';
import { PlaintesQueryDto } from './dto/plaintes-query.dto';

const INCLUDE_RELATIONS = {
  client: { select: { id: true, nom: true, email: true } },
  depot: { select: { id: true, nomCommerce: true } },
};

@Injectable()
export class PlaintesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clientId: string, dto: CreatePlainteDto) {
    const depot = await this.prisma.depot.findUnique({ where: { id: dto.depotId } });
    if (!depot) {
      throw new NotFoundException('Dépôt introuvable.');
    }
    return this.prisma.plainte.create({
      data: { ...dto, clientId },
      include: INCLUDE_RELATIONS,
    });
  }

  findAll(query: PlaintesQueryDto) {
    return this.prisma.plainte.findMany({
      where: {
        statut: query.statut,
        depotId: query.depotId,
      },
      include: INCLUDE_RELATIONS,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const plainte = await this.prisma.plainte.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });
    if (!plainte) {
      throw new NotFoundException('Plainte introuvable.');
    }
    return plainte;
  }

  async resoudre(id: string) {
    await this.findOne(id);
    return this.prisma.plainte.update({
      where: { id },
      data: { statut: StatutPlainte.RESOLUE },
      include: INCLUDE_RELATIONS,
    });
  }

  async appliquerAction(id: string, action: ActionAdminPlainte) {
    const plainte = await this.findOne(id);

    if (action === ActionAdminPlainte.SUSPENSION_TEMPORAIRE || action === ActionAdminPlainte.BANNISSEMENT) {
      await this.prisma.depot.update({
        where: { id: plainte.depotId },
        data: { statut: StatutDepot.BLOQUE },
      });
    }

    return this.prisma.plainte.update({
      where: { id },
      data: { actionAdmin: action },
      include: INCLUDE_RELATIONS,
    });
  }
}
