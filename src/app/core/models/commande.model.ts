import { ProduitDepot } from './produit.model';

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
  produitDepot: ProduitDepot;
  quantite: number;
  prixUnitaire: number;
  montantConsigneUnitaire: number;
  consigne: { id: string; montant: number; statut: 'BLOQUEE' | 'REMBOURSEE' } | null;
}

export interface Commande {
  id: string;
  clientId: string;
  depotId: string;
  depot: { id: string; nomCommerce: string; telephone: string; adresse: string };
  client: { id: string; nom: string; telephone: string | null };
  mode: ModeReception;
  statut: StatutCommande;
  montantTotal: number;
  fraisLivraison: number;
  referenceUnique: string;
  adresseLivraison: string | null;
  instructions: string | null;
  lignes: LigneCommande[];
  avis: { id: string; note: number; commentaire: string | null } | null;
  createdAt: string;
}
