import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { CommandesService } from '../../../core/services/commandes.service';
import { Commande, ModeReception, StatutCommande } from '../../../core/models/commande.model';

const ETAPES: Record<ModeReception, { statut: StatutCommande; label: string }[]> = {
  RETRAIT: [
    { statut: StatutCommande.EN_ATTENTE, label: 'En attente' },
    { statut: StatutCommande.CONFIRMEE, label: 'Confirmée' },
    { statut: StatutCommande.PRETE_A_RETIRER, label: 'Prête à retirer' },
    { statut: StatutCommande.TERMINEE, label: 'Terminée' },
  ],
  LIVRAISON: [
    { statut: StatutCommande.EN_ATTENTE, label: 'En attente' },
    { statut: StatutCommande.CONFIRMEE, label: 'Confirmée' },
    { statut: StatutCommande.EN_PREPARATION, label: 'En préparation' },
    { statut: StatutCommande.EN_ROUTE, label: 'En route' },
    { statut: StatutCommande.LIVREE, label: 'Livrée' },
  ],
};

const LABELS_STATUT: Record<StatutCommande, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  PRETE_A_RETIRER: 'Prête à retirer',
  EN_PREPARATION: 'En préparation',
  EN_ROUTE: 'En route',
  TERMINEE: 'Terminée',
  LIVREE: 'Livrée',
};

const STATUTS_TERMINES: StatutCommande[] = [StatutCommande.TERMINEE, StatutCommande.LIVREE];

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [DecimalPipe, DatePipe, RouterLink],
  templateUrl: './order-detail.html',
})
export class OrderDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly commandesService = inject(CommandesService);

  readonly commande = signal<Commande | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly labelsStatut = LABELS_STATUT;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.commandesService.getOne(id).subscribe({
      next: (commande) => {
        this.commande.set(commande);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Commande introuvable.');
        this.loading.set(false);
      },
    });
  }

  etapes(commande: Commande) {
    const steps = ETAPES[commande.mode];
    const currentIndex = steps.findIndex((s) => s.statut === commande.statut);
    return steps.map((s, i) => ({ ...s, atteinte: i <= currentIndex }));
  }

  estTerminee(commande: Commande): boolean {
    return STATUTS_TERMINES.includes(commande.statut);
  }

  etoiles(note: number): string {
    return '★'.repeat(note) + '☆'.repeat(5 - note);
  }
}
