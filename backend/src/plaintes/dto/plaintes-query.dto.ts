import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StatutPlainte } from '@prisma/client';

export class PlaintesQueryDto {
  @IsOptional()
  @IsEnum(StatutPlainte)
  statut?: StatutPlainte;

  @IsOptional()
  @IsString()
  depotId?: string;
}
