import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

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
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
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
