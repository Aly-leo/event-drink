import { IsEnum } from 'class-validator';
import { StatutCommande } from '@prisma/client';

export class UpdateStatutCommandeDto {
  @IsEnum(StatutCommande)
  statut!: StatutCommande;
}
