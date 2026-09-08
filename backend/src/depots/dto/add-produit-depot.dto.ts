import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddProduitDepotDto {
  @IsString()
  produitId!: string;

  @IsInt()
  @Min(0)
  prix!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  montantConsigne?: number;

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantiteStock?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  seuilAlerte?: number;
}
