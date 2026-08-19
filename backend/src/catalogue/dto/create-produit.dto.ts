import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CategorieProduit } from '@prisma/client';

export class CreateProduitDto {
  @IsString()
  nom!: string;

  @IsString()
  marque!: string;

  @IsString()
  contenance!: string;

  @IsEnum(CategorieProduit)
  categorie!: CategorieProduit;

  @IsOptional()
  @IsString()
  visuelUrl?: string;

  @IsBoolean()
  estConsignable!: boolean;
}
