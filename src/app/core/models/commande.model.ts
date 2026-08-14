export enum ModeReception {
  RETRAIT = 'RETRAIT',
  LIVRAISON = 'LIVRAISON',
}

export enum StatutCommande {
  EN_ATTENTE = 'EN_ATTENTE',
  CONFIRMEE = 'CONFIRMEE',
  PRETE_A_RETIRER = 'PRETE_A_RETIRER',
  EN_PREPARATION = 'EN_PREPARATION',
  EN_ROUTE = 'EN_ROUTE',
  TERMINEE = 'TERMINEE',
  LIVREE = 'LIVREE',
}

export interface LigneCommande {
  id: string;
  produitDepotId: string;
  quantite: number;
  prixUnitaire: number;
  montantConsigneUnitaire: number;
}

export interface Commande {
  id: string;
  clientId: string;
  depotId: string;
  mode: ModeReception;
  statut: StatutCommande;
  montantTotal: number;
  fraisLivraison: number;
  referenceUnique: string;
  lignes: LigneCommande[];
  createdAt: string;
}
