import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateMyDepotDto {
  @IsString()
  @MinLength(2)
  nomCommerce!: string;

  @IsString()
  @MinLength(6)
  telephone!: string;

  @IsString()
  @MinLength(5)
  adresse!: string;

  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsOptional()
  @IsBoolean()
  modeLivraison?: boolean;

  @IsOptional()
  @IsBoolean()
  modeRetrait?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  fraisLivraison?: number;
}
