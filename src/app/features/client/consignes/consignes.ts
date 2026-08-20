import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CommandesService } from '../../../core/services/commandes.service';
import { Commande, LigneCommande } from '../../../core/models/commande.model';

interface ConsigneGroupee {
  commande: Commande;
  lignes: LigneCommande[];
  total: number;
}

@Component({
  selector: 'app-consignes',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './consignes.html',
})
export class Consignes {
  private readonly commandesService = inject(CommandesService);

  readonly commandes = signal<Commande[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly groupes = computed<ConsigneGroupee[]>(() =>
    this.commandes()
      .map((commande) => ({
        commande,
        lignes: commande.lignes.filter((l) => l.consigne?.statut === 'BLOQUEE'),
      }))
      .filter((g) => g.lignes.length > 0)
      .map((g) => ({ ...g, total: g.lignes.reduce((sum, l) => sum + (l.consigne?.montant ?? 0), 0) }))
  );

  readonly totalCasiers = computed(() =>
    this.groupes().reduce((sum, g) => sum + g.lignes.reduce((s, l) => s + l.quantite, 0), 0)
  );

  readonly valeurTotale = computed(() => this.groupes().reduce((sum, g) => sum + g.total, 0));

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
        this.error.set('Impossible de charger tes consignes.');
        this.loading.set(false);
      },
    });
  }
}
