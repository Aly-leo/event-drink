import { IsEnum, IsOptional } from 'class-validator';
import { StatutDepot } from '@prisma/client';

export class DepotsAdminQueryDto {
  @IsOptional()
  @IsEnum(StatutDepot)
  statut?: StatutDepot;
}
