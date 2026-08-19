import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Depot } from '../../depot';

@Component({
  selector: 'app-depot-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depot-onboarding.html',
  styleUrl: './depot-onboarding.scss',
})
export class DepotOnboarding {
  fichierSelectionne = signal<File | null>(null);
  envoiEnCours = signal(false);
  erreur = signal<string | null>(null);

  modele = {
    nomDepot: '',
    telephone: '',
    retraitSurPlace: true,
    livraisonDomicile: true,
    fraisLivraison: 1500,
  };

  constructor(private depotService: Depot) {}

  onFichierChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fichierSelectionne.set(input.files[0]);
    }
  }

  enregistrerBrouillon() {
    console.log('Brouillon :', this.modele, this.fichierSelectionne());
  }

  onSubmit(formulaire: any) {
    if (formulaire.invalid) {
      return;
    }

    this.erreur.set(null);
    this.envoiEnCours.set(true);

    const payload = {
      nomCommerce: this.modele.nomDepot,
      telephone: this.modele.telephone,
      adresse: 'À définir via la carte',
      latitude: 4.0511,
      longitude: 9.7015,
      modeLivraison: this.modele.livraisonDomicile,
      modeRetrait: this.modele.retraitSurPlace,
      fraisLivraison: this.modele.fraisLivraison,
    };

    this.depotService.onboarding(payload).subscribe({
      next: (res) => {
        console.log('Dépôt créé avec succès :', res);
        this.envoiEnCours.set(false);
      },
      error: (err) => {
        console.error('Erreur onboarding :', err);
        this.erreur.set(err.error?.message ?? 'Une erreur est survenue.');
        this.envoiEnCours.set(false);
      }
    });
  }
}
