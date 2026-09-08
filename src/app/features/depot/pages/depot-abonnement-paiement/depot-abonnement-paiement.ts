import { Component, signal, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AbonnementService } from '../../../../core/services/abonnement.service';
import { OperateurPaiement, PalierAbonnement } from '../../../../core/models/abonnement.model';

export type EtapePaiement = 'FORMULAIRE' | 'EN_COURS' | 'REUSSI' | 'ECHEC';

interface DetailPalier {
  label: string;
  prix: number;
  avantages: string[];
  couleur: string;
}

@Component({
  selector: 'app-depot-abonnement-paiement',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './depot-abonnement-paiement.html',
  styleUrl: './depot-abonnement-paiement.scss',
})
export class DepotAbonnementPaiement {
  private readonly router = inject(Router);
  private readonly abonnementService = inject(AbonnementService);

  readonly OperateurPaiement = OperateurPaiement;

  palierRoute = input<string>('', { alias: 'palier' });

  palier = computed<PalierAbonnement>(() => {
    const val = this.palierRoute();
    return val === 'PREMIUM' ? PalierAbonnement.PREMIUM : PalierAbonnement.STANDARD;
  });

  details: Record<PalierAbonnement, DetailPalier> = {
    STANDARD: {
      label: 'Standard',
      prix: 5000,
      avantages: ['Visibilité dans l\'annuaire', 'Gestion du catalogue', 'Réception des commandes'],
      couleur: '#545f73',
    },
    PREMIUM: {
      label: 'Premium',
      prix: 10000,
      avantages: ['Tout Standard, plus :', 'Mise en avant en tête de liste', 'Badge "Recommandé"', 'Statistiques de vente détaillées'],
      couleur: '#a33900',
    },
  };

  detailActuel = computed(() => this.details[this.palier()]);

  etape = signal<EtapePaiement>('FORMULAIRE');
  operateur = signal<OperateurPaiement>(OperateurPaiement.ORANGE_MONEY);
  numeroTelephone = signal('');
  erreur = signal<string | null>(null);

  numeroValide = computed(() => {
    const numero = this.numeroTelephone().replace(/\s/g, '');
    return /^(6[0-9]{8}|\+2376[0-9]{8})$/.test(numero);
  });

  choisirOperateur(op: OperateurPaiement) {
    this.operateur.set(op);
  }

  confirmerPaiement() {
    if (!this.numeroValide()) return;

    this.etape.set('EN_COURS');
    this.erreur.set(null);

    this.abonnementService
      .payer({
        palier: this.palier(),
        operateur: this.operateur(),
        numeroTelephone: this.numeroTelephone().replace(/\s/g, ''),
      })
      .subscribe({
        next: () => this.etape.set('REUSSI'),
        error: (err) => {
          this.erreur.set(err?.error?.message ?? 'Le paiement a échoué.');
          this.etape.set('ECHEC');
        },
      });
  }

  retourAbonnement() {
    this.router.navigateByUrl('/depot/abonnement');
  }

  reessayer() {
    this.etape.set('FORMULAIRE');
  }
}
