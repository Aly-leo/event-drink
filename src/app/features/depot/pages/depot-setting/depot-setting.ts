import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepotsService } from '../../../../core/services/depots.service';

export interface HoraireJour { jour: string; ouvert: boolean; debut: string; fin: string; }

@Component({
  selector: 'app-depot-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depot-setting.html',
  styleUrl: './depot-setting.scss',
})
export class DepotSetting {
  private readonly depotsService = inject(DepotsService);

  loading = signal(true);
  error = signal<string | null>(null);
  submitting = signal(false);
  succes = signal(false);

  nomDepot = signal<string>('');
  adresse = signal<string>('');
  description = signal<string>('');

  livraisonActive = signal<boolean>(false);
  retraitActif = signal<boolean>(true);
  fraisLivraison = signal<number>(0);

  /** Non couvert par le schéma actuel — non persisté côté backend pour l'instant. */
  horaires = signal<HoraireJour[]>([
    { jour: 'Lundi', ouvert: true, debut: '08:00', fin: '18:00' },
    { jour: 'Mardi', ouvert: true, debut: '08:00', fin: '18:00' },
    { jour: 'Mercredi', ouvert: true, debut: '08:00', fin: '18:00' },
    { jour: 'Jeudi', ouvert: true, debut: '08:00', fin: '18:00' },
    { jour: 'Vendredi', ouvert: true, debut: '08:00', fin: '18:00' },
    { jour: 'Samedi', ouvert: false, debut: '09:00', fin: '15:00' },
    { jour: 'Dimanche', ouvert: false, debut: '09:00', fin: '12:00' },
  ]);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.depotsService.getMyDepot().subscribe({
      next: (depot) => {
        if (depot) {
          this.nomDepot.set(depot.nomCommerce);
          this.adresse.set(depot.adresse);
          this.livraisonActive.set(depot.modeLivraison);
          this.retraitActif.set(depot.modeRetrait);
          this.fraisLivraison.set(depot.fraisLivraison);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les paramètres du dépôt.');
        this.loading.set(false);
      },
    });
  }

  enregistrer() {
    this.submitting.set(true);
    this.error.set(null);
    this.succes.set(false);

    this.depotsService
      .updateMyDepot({
        nomCommerce: this.nomDepot(),
        adresse: this.adresse(),
        modeLivraison: this.livraisonActive(),
        modeRetrait: this.retraitActif(),
        fraisLivraison: this.fraisLivraison(),
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.succes.set(true);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message ?? 'Impossible d\'enregistrer les modifications.');
        },
      });
  }

  toggleJour(index: number) {
    this.horaires.update(list => {
      const newList = [...list];
      newList[index] = { ...newList[index], ouvert: !newList[index].ouvert };
      return newList;
    });
  }
}
