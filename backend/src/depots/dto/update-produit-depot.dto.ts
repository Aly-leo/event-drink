import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateProduitDepotDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  prix?: number;

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
  seuilAlerte?: number;
}
