import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MotifPlainte } from '@prisma/client';

export class CreatePlainteDto {
  @IsString()
  depotId!: string;

  @IsOptional()
  @IsString()
  referenceCommande?: string;

  @IsEnum(MotifPlainte)
  motif!: MotifPlainte;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;
}
