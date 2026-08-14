export enum CategorieProduit {
  BIERE_LOCALE = 'BIERE_LOCALE',
  BIERE_IMPORTEE = 'BIERE_IMPORTEE',
  CHAMPAGNE_EFFERVESCENT = 'CHAMPAGNE_EFFERVESCENT',
  VIN = 'VIN',
  SANS_ALCOOL = 'SANS_ALCOOL',
}

export interface Produit {
  id: string;
  nom: string;
  marque: string;
  contenance: string;
  categorie: CategorieProduit;
  visuelUrl?: string;
  estConsignable: boolean;
}

export interface ProduitDepot {
  id: string;
  depotId: string;
  produitId: string;
  produit: Produit;
  prix: number;
  montantConsigne: number;
  disponible: boolean;
}
