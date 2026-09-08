import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TypeMouvementStock } from '@prisma/client';

export class CreateMouvementStockDto {
  @IsEnum(TypeMouvementStock)
  type!: TypeMouvementStock;

  @IsInt()
  @Min(1)
  quantite!: number;

  @IsOptional()
  @IsString()
  motif?: string;
}
