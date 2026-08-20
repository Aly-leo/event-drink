import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateMyDepotDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nomCommerce?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  telephone?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  adresse?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

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

  @IsOptional()
  @IsString()
  visuelUrl?: string;
}
