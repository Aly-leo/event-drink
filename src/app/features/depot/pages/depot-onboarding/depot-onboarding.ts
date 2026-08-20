import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DepotsService } from '../../../../core/services/depots.service';
import { GeolocationService } from '../../../../core/services/geolocation.service';

@Component({
  selector: 'app-depot-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depot-onboarding.html',
  styleUrl: './depot-onboarding.scss',
})
export class DepotOnboarding {
  private readonly depotsService = inject(DepotsService);
  private readonly geolocationService = inject(GeolocationService);
  private readonly router = inject(Router);

  fichierSelectionne = signal<File | null>(null);
  envoiEnCours = signal(false);
  erreur = signal<string | null>(null);

  modele = {
    nomDepot: '',
    telephone: '',
    adresse: '',
    retraitSurPlace: true,
    livraisonDomicile: true,
    fraisLivraison: 1500,
  };

  onFichierChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fichierSelectionne.set(input.files[0]);
    }
  }

  enregistrerBrouillon() {
    console.log('Brouillon :', this.modele, this.fichierSelectionne());
  }

  async onSubmit(formulaire: NgForm) {
    if (formulaire.invalid) {
      return;
    }

    this.erreur.set(null);
    this.envoiEnCours.set(true);

    const { coords } = await this.geolocationService.getPosition();

    const payload = {
      nomCommerce: this.modele.nomDepot,
      telephone: this.modele.telephone,
      adresse: this.modele.adresse,
      latitude: coords.lat,
      longitude: coords.lng,
      modeLivraison: this.modele.livraisonDomicile,
      modeRetrait: this.modele.retraitSurPlace,
      fraisLivraison: this.modele.fraisLivraison,
    };

    this.depotsService.createMyDepot(payload).subscribe({
      next: () => {
        this.envoiEnCours.set(false);
        this.router.navigateByUrl('/depot/dashboard');
      },
      error: (err) => {
        this.erreur.set(err.error?.message ?? 'Une erreur est survenue.');
        this.envoiEnCours.set(false);
      },
    });
  }
}
