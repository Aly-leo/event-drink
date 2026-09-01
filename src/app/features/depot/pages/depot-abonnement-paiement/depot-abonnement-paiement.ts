import { Component, signal, computed, inject, input} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

export type PalierAbonnement = 'STANDARD' | 'PREMIUM';
export type OperateurPaiement = 'ORANGE_MONEY' | 'MTN_MOMO';
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
  private router = inject(Router);

  // Remplace l'accès manuel à ActivatedRoute et ngOnInit() via la route binding
  palierRoute = input<string>('', { alias: 'palier' });

  // Signal calculé automatiquement pour garder le fallback 'STANDARD'
  palier = computed<PalierAbonnement>(() => {
    const val = this.palierRoute();
    return val === 'PREMIUM' ? 'PREMIUM' : 'STANDARD';
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
  operateur = signal<OperateurPaiement>('ORANGE_MONEY');
  numeroTelephone = signal('');

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

    setTimeout(() => {
      this.etape.set('REUSSI');
    }, 2000);
  }

  retourAbonnement() {
    this.router.navigateByUrl('/depot/abonnement');
  }

  reessayer() {
    this.etape.set('FORMULAIRE');
  }
}
