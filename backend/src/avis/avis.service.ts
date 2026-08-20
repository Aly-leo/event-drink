import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StatutCommande } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvisDto } from './dto/create-avis.dto';

const STATUTS_TERMINES: StatutCommande[] = [StatutCommande.TERMINEE, StatutCommande.LIVREE];

@Injectable()
export class AvisService {
  constructor(private readonly prisma: PrismaService) {}

  async create(clientId: string, dto: CreateAvisDto) {
    const commande = await this.prisma.commande.findUnique({ where: { id: dto.commandeId } });
    if (!commande || commande.clientId !== clientId) {
      throw new NotFoundException('Commande introuvable.');
    }
    if (!STATUTS_TERMINES.includes(commande.statut)) {
      throw new BadRequestException("Cette commande n'est pas encore terminée.");
    }

    try {
      return await this.prisma.avis.create({
        data: {
          clientId,
          depotId: commande.depotId,
          commandeId: commande.id,
          note: dto.note,
          commentaire: dto.commentaire,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Un avis a déjà été laissé pour cette commande.');
      }
      throw e;
    }
  }
}
