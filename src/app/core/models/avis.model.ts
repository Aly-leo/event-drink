export interface Avis {
  id: string;
  clientId: string;
  client: { nom: string };
  depotId: string;
  commandeId: string;
  note: number;
  commentaire: string | null;
  createdAt: string;
}
