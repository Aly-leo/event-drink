import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { AbonnementService } from '../../../../core/services/abonnement.service';
import { Abonnement as AbonnementModel, PalierAbonnement, StatutAbonnement } from '../../../../core/models/abonnement.model';
import { PaiementAbonnement } from '../../../../core/models/abonnement.model';

interface DetailPalier {
  label: string;
  prix: number;
  avantages: string[];
}

@Component({
  selector: 'app-abonnement',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './abonnement.html',
  styleUrl: './abonnement.scss',
})
export class Abonnement {
  private readonly abonnementService = inject(AbonnementService);
  private readonly router = inject(Router);

  loading = signal(true);
  error = signal<string | null>(null);

  abonnement = signal<AbonnementModel | null>(null);
  historique = signal<PaiementAbonnement[]>([]);

  statut = computed<StatutAbonnement>(() => this.abonnement()?.statut ?? StatutAbonnement.EN_ATTENTE_PAIEMENT);
  palierActuel = computed<PalierAbonnement>(() => this.abonnement()?.palier ?? PalierAbonnement.STANDARD);
  dateRenouvellement = computed(() => {
    const date = this.abonnement()?.dateRenouvellement;
    return date ? new Date(date).toLocaleDateString('fr-FR') : '—';
  });

  paliers: Record<PalierAbonnement, DetailPalier> = {
    STANDARD: { label: 'Standard', prix: 5000, avantages: ['Visibilité dans l\'annuaire', 'Gestion du catalogue', 'Réception des commandes'] },
    PREMIUM: { label: 'Premium', prix: 10000, avantages: ['Tout Standard, plus :', 'Mise en avant en tête de liste', 'Badge "Recommandé"', 'Statistiques de vente détaillées'] },
  };

  clesPaliers: PalierAbonnement[] = [PalierAbonnement.STANDARD, PalierAbonnement.PREMIUM];
  prixActuel = computed(() => this.paliers[this.palierActuel()].prix);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.abonnementService.getMyAbonnement().subscribe({
      next: (abonnement) => {
        this.abonnement.set(abonnement);
        this.abonnementService.getMesPaiements().subscribe({
          next: (paiements) => {
            this.historique.set(paiements);
            this.loading.set(false);
          },
          error: () => this.loading.set(false),
        });
      },
      error: () => {
        this.error.set("Impossible de charger l'abonnement.");
        this.loading.set(false);
      },
    });
  }

  changerPalier(palier: PalierAbonnement): void {
    this.router.navigate(['/depot/abonnement/paiement', palier]);
  }

  renouvelerMaintenant(): void {
    this.router.navigate(['/depot/abonnement/paiement', this.palierActuel()]);
  }

  labelStatut(statut: StatutAbonnement): string {
    switch (statut) {
      case StatutAbonnement.ACTIF: return 'Actif';
      case StatutAbonnement.EXPIRE: return 'Expiré';
      case StatutAbonnement.EN_ATTENTE_PAIEMENT: return 'En attente de paiement';
    }
  }

  badgeStatut(statut: StatutAbonnement): string {
    switch (statut) {
      case StatutAbonnement.ACTIF: return 'bg-success-subtle text-success';
      case StatutAbonnement.EXPIRE: return 'bg-danger-subtle text-danger';
      case StatutAbonnement.EN_ATTENTE_PAIEMENT: return 'bg-warning-subtle text-warning-emphasis';
    }
  }
}
