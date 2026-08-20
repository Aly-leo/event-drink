import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { CommandesService } from '../../../core/services/commandes.service';
import { Commande, StatutCommande } from '../../../core/models/commande.model';

const LABELS_STATUT: Record<StatutCommande, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  PRETE_A_RETIRER: 'Prête à retirer',
  EN_PREPARATION: 'En préparation',
  EN_ROUTE: 'En route',
  TERMINEE: 'Terminée',
  LIVREE: 'Livrée',
};

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, DatePipe],
  templateUrl: './orders-list.html',
})
export class OrdersList {
  private readonly commandesService = inject(CommandesService);

  readonly commandes = signal<Commande[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly labelsStatut = LABELS_STATUT;

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.commandesService.getMine().subscribe({
      next: (commandes) => {
        this.commandes.set(commandes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger tes commandes.');
        this.loading.set(false);
      },
    });
  }
}
