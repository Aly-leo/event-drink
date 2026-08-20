export enum StatutDepot {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  BLOQUE = 'BLOQUE',
}

export interface Depot {
  id: string;
  ownerId: string;
  nomCommerce: string;
  telephone: string;
  adresse: string;
  latitude: number;
  longitude: number;
  modeLivraison: boolean;
  modeRetrait: boolean;
  fraisLivraison: number;
  statut: StatutDepot;
  visuelUrl?: string | null;
  createdAt: string;
  distanceKm?: number | null;
  noteMoyenne?: number | null;
  nombreAvis?: number;
}

export interface DepotDetail extends Depot {
  produits: import('./produit.model').ProduitDepot[];
  avis: import('./avis.model').Avis[];
}
