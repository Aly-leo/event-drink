import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ModeReception } from '@prisma/client';

export class LigneCommandeInputDto {
  @IsString()
  produitDepotId!: string;

  @IsInt()
  @Min(1)
  quantite!: number;
}

export class CreateCommandeDto {
  @IsString()
  depotId!: string;

  @IsEnum(ModeReception)
  mode!: ModeReception;

  @IsOptional()
  @IsString()
  adresseLivraison?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LigneCommandeInputDto)
  lignes!: LigneCommandeInputDto[];
}
