import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommandesService } from '../../../../core/services/commandes.service';
import { Commande, StatutCommande } from '../../../../core/models/commande.model';

interface OptionFiltre {
  valeur: StatutCommande | 'TOUTES';
  label: string;
}

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
  selector: 'app-commandes-recues',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './commandes-recues.html',
  styleUrl: './commandes-recues.scss',
})
export class CommandesRecues {
  private readonly commandesService = inject(CommandesService);

  loading = signal(true);
  error = signal<string | null>(null);

  recherche = signal<string>('');
  filtreStatut = signal<StatutCommande | 'TOUTES'>('TOUTES');

  filtres: OptionFiltre[] = [
    { valeur: 'TOUTES', label: 'Toutes' },
    { valeur: StatutCommande.EN_ATTENTE, label: 'En attente' },
    { valeur: StatutCommande.CONFIRMEE, label: 'Confirmées' },
    { valeur: StatutCommande.EN_PREPARATION, label: 'En préparation' },
    { valeur: StatutCommande.EN_ROUTE, label: 'En route' },
    { valeur: StatutCommande.LIVREE, label: 'Livrées' },
  ];

  commandes = signal<Commande[]>([]);

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
        this.error.set('Impossible de charger les commandes.');
        this.loading.set(false);
      },
    });
  }

  commandesFiltrees = computed(() => {
    const terme = this.recherche().toLowerCase().trim();
    const statut = this.filtreStatut();
    return this.commandes().filter((c) => {
      const matchRecherche =
        c.referenceUnique.toLowerCase().includes(terme) || c.client.nom.toLowerCase().includes(terme);
      const matchStatut = statut === 'TOUTES' || c.statut === statut;
      return matchRecherche && matchStatut;
    });
  });

  nbEnAttente = computed(() => this.commandes().filter((c) => c.statut === StatutCommande.EN_ATTENTE).length);

  changerFiltre(statut: StatutCommande | 'TOUTES') {
    this.filtreStatut.set(statut);
  }

  labelStatut(statut: StatutCommande): string {
    return LABELS_STATUT[statut] ?? statut;
  }

  getBadgeClass(statut: StatutCommande): string {
    switch (statut) {
      case StatutCommande.EN_ATTENTE:
        return 'bg-danger text-white';
      case StatutCommande.CONFIRMEE:
        return 'bg-primary text-white';
      case StatutCommande.EN_PREPARATION:
      case StatutCommande.PRETE_A_RETIRER:
        return 'bg-warning text-dark';
      case StatutCommande.EN_ROUTE:
        return 'bg-info text-white';
      case StatutCommande.TERMINEE:
      case StatutCommande.LIVREE:
        return 'bg-success text-white';
      default:
        return 'bg-secondary text-white';
    }
  }

  getBorderClass(statut: StatutCommande): string {
    switch (statut) {
      case StatutCommande.EN_ATTENTE:
        return 'border-start border-danger border-4';
      case StatutCommande.CONFIRMEE:
        return 'border-start border-primary border-4';
      case StatutCommande.EN_PREPARATION:
      case StatutCommande.PRETE_A_RETIRER:
        return 'border-start border-warning border-4';
      case StatutCommande.EN_ROUTE:
        return 'border-start border-info border-4';
      case StatutCommande.TERMINEE:
      case StatutCommande.LIVREE:
        return 'border-start border-success border-4';
      default:
        return '';
    }
  }
}
