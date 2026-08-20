export enum MotifPlainte {
  REFUS_CONSIGNE = 'REFUS_CONSIGNE',
  PRODUIT_MANQUANT = 'PRODUIT_MANQUANT',
  PRODUIT_ENDOMMAGE = 'PRODUIT_ENDOMMAGE',
  RETARD_LIVRAISON = 'RETARD_LIVRAISON',
  QUALITE_SERVICE = 'QUALITE_SERVICE',
  AUTRE = 'AUTRE',
}

export enum StatutPlainte {
  EN_ATTENTE = 'EN_ATTENTE',
  RESOLUE = 'RESOLUE',
}

export enum ActionAdminPlainte {
  AVERTISSEMENT = 'AVERTISSEMENT',
  SUSPENSION_TEMPORAIRE = 'SUSPENSION_TEMPORAIRE',
  BANNISSEMENT = 'BANNISSEMENT',
}

export interface Plainte {
  id: string;
  clientId: string;
  client: { id: string; nom: string; email: string };
  depotId: string;
  depot: { id: string; nomCommerce: string };
  referenceCommande: string | null;
  motif: MotifPlainte;
  message: string;
  photoUrl: string | null;
  statut: StatutPlainte;
  actionAdmin: ActionAdminPlainte | null;
  createdAt: string;
}
