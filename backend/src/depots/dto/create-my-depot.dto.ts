import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

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
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
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
