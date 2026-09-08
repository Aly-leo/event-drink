import { IsEnum, IsString, Matches } from 'class-validator';
import { OperateurPaiement, PalierAbonnement } from '@prisma/client';

export class CreerPaiementAbonnementDto {
  @IsEnum(PalierAbonnement)
  palier!: PalierAbonnement;

  @IsEnum(OperateurPaiement)
  operateur!: OperateurPaiement;

  @IsString()
  @Matches(/^(6[0-9]{8}|\+2376[0-9]{8})$/, { message: 'Numéro de téléphone invalide.' })
  numeroTelephone!: string;
}
