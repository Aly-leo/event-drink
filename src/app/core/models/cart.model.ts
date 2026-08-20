export interface CartItem {
  produitDepotId: string;
  nom: string;
  marque: string;
  contenance: string;
  visuelUrl?: string | null;
  prix: number;
  montantConsigne: number;
  quantite: number;
}

export interface CartDepotInfo {
  id: string;
  nomCommerce: string;
  fraisLivraison: number;
  modeLivraison: boolean;
  modeRetrait: boolean;
}

export interface CartState {
  depot: CartDepotInfo | null;
  items: CartItem[];
}
