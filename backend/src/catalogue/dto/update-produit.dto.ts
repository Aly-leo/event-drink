import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { CategorieProduit } from '@prisma/client';

export class UpdateProduitDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  marque?: string;

  @IsOptional()
  @IsString()
  contenance?: string;

  @IsOptional()
  @IsEnum(CategorieProduit)
  categorie?: CategorieProduit;

  @IsOptional()
  @IsString()
  visuelUrl?: string;

  @IsOptional()
  @IsBoolean()
  estConsignable?: boolean;
}
