export enum PalierAbonnement {
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM',
}

export enum StatutAbonnement {
  ACTIF = 'ACTIF',
  EXPIRE = 'EXPIRE',
  EN_ATTENTE_PAIEMENT = 'EN_ATTENTE_PAIEMENT',
}

export enum OperateurPaiement {
  ORANGE_MONEY = 'ORANGE_MONEY',
  MTN_MOMO = 'MTN_MOMO',
}

export enum StatutPaiement {
  REUSSI = 'REUSSI',
  ECHOUE = 'ECHOUE',
}

export interface Abonnement {
  id: string;
  depotId: string;
  palier: PalierAbonnement;
  statut: StatutAbonnement;
  dateRenouvellement: string | null;
  createdAt: string;
}

export interface PaiementAbonnement {
  id: string;
  abonnementId: string;
  palier: PalierAbonnement;
  montant: number;
  operateur: OperateurPaiement;
  numeroTelephone: string;
  statut: StatutPaiement;
  reference: string;
  createdAt: string;
}
