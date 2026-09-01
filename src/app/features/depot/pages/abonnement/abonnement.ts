import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export type PalierAbonnement = 'STANDARD' | 'PREMIUM';
export type StatutAbonnement = 'ACTIF' | 'EXPIRE' | 'EN_ATTENTE_PAIEMENT';

// 1. Interface pour le détail d'un palier
export interface DetailPalier {
  label: string;
  prix: number;
  avantages: string[];
}

interface PaiementHistorique {
  id: string;
  date: string;
  montant: number;
  palier: PalierAbonnement;
  statut: 'REUSSI' | 'ECHOUE';
  reference: string;
}

@Component({
  selector: 'app-abonnement',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './abonnement.html',
  styleUrl: './abonnement.scss',
})
export class Abonnement {
  private router = inject(Router);
  // --- État actuel de l'abonnement (données fictives pour l'instant) ---
  statut = signal<StatutAbonnement>('ACTIF');
  palierActuel = signal<PalierAbonnement>('STANDARD');
  dateRenouvellement = signal('15/09/2026');

  paliers = {
    STANDARD: { label: 'Standard', prix: 5000, avantages: ['Visibilité dans l\'annuaire', 'Gestion du catalogue', 'Réception des commandes'] },
    PREMIUM: { label: 'Premium', prix: 10000, avantages: ['Tout Standard, plus :', 'Mise en avant en tête de liste', 'Badge "Recommandé"', 'Statistiques de vente détaillées'] },
  };

  clesPaliers: PalierAbonnement[] = ['STANDARD', 'PREMIUM'];
  prixActuel = computed(() => this.paliers[this.palierActuel()].prix);

  // --- Historique des paiements ---
  historique = signal<PaiementHistorique[]>([
    { id: '1', date: '15/08/2026', montant: 5000, palier: 'STANDARD', statut: 'REUSSI', reference: 'PAY-2026-0815-001' },
    { id: '2', date: '15/07/2026', montant: 5000, palier: 'STANDARD', statut: 'REUSSI', reference: 'PAY-2026-0715-001' },
    { id: '3', date: '15/06/2026', montant: 5000, palier: 'STANDARD', statut: 'REUSSI', reference: 'PAY-2026-0615-001' },
  ]);

  // --- Actions ---
  changerPalier(nouveauPalier: PalierAbonnement) {
    this.palierActuel.set(nouveauPalier);
    console.log('Palier changé vers :', nouveauPalier);
    // TODO: brancher sur l'endpoint d'abonnement une fois disponible côté backend
  }

  renouvelerMaintenant() {
    this.router.navigate(['/depot/abonnement/paiement', this.palierActuel()]);
    console.log('Renouvellement demandé pour le palier :', this.palierActuel());
    // TODO: déclencher le paiement Mobile Money puis mettre à jour le statut/la date
  }

  labelStatut(statut: StatutAbonnement): string {
    switch (statut) {
      case 'ACTIF': return 'Actif';
      case 'EXPIRE': return 'Expiré';
      case 'EN_ATTENTE_PAIEMENT': return 'En attente de paiement';
    }
  }

  badgeStatut(statut: StatutAbonnement): string {
    switch (statut) {
      case 'ACTIF': return 'bg-success-subtle text-success';
      case 'EXPIRE': return 'bg-danger-subtle text-danger';
      case 'EN_ATTENTE_PAIEMENT': return 'bg-warning-subtle text-warning-emphasis';
    }
  }
}




