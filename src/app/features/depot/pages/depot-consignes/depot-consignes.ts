import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommandesService } from '../../../../core/services/commandes.service';
import { Commande } from '../../../../core/models/commande.model';

interface ConsigneAffichee {
  id: string;
  client: string;
  produit: string;
  montant: number;
  dateCommande: string;
  statut: 'BLOQUEE' | 'REMBOURSEE';
}

@Component({
  selector: 'app-depot-consignes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './depot-consignes.html',
  styleUrl: './depot-consignes.scss',
})
export class DepotConsignes {
  private readonly commandesService = inject(CommandesService);

  loading = signal(true);
  error = signal<string | null>(null);
  private commandes = signal<Commande[]>([]);

  private restitueesLocalement = signal<Set<string>>(new Set());

  consignes = computed<ConsigneAffichee[]>(() => {
    const restituees = this.restitueesLocalement();
    return this.commandes()
      .flatMap((commande) =>
        commande.lignes
          .filter((ligne) => ligne.consigne)
          .map((ligne) => ({
            id: ligne.consigne!.id,
            client: commande.client.nom,
            produit: ligne.produitDepot.produit.nom,
            montant: ligne.consigne!.montant,
            dateCommande: commande.createdAt,
            statut: (restituees.has(ligne.consigne!.id) ? 'REMBOURSEE' : ligne.consigne!.statut) as
              | 'BLOQUEE'
              | 'REMBOURSEE',
          }))
      )
      .sort((a, b) => new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime());
  });

  consignesBloquees = computed(() => this.consignes().filter((c) => c.statut === 'BLOQUEE'));
  totalBloque = computed(() => this.consignesBloquees().reduce((somme, c) => somme + c.montant, 0));

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.commandesService.getForMyDepot().subscribe({
      next: (commandes) => {
        this.commandes.set(commandes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les consignes.');
        this.loading.set(false);
      },
    });
  }

  marquerRestituee(id: string) {
    // TODO: brancher sur un endpoint PATCH /consignes/:id/restituer une fois disponible côté backend.
    this.restitueesLocalement.update((set) => new Set(set).add(id));
  }
}
