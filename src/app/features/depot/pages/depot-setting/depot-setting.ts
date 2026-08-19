import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface HoraireJour { jour: string; ouvert: boolean; debut: string; fin: string; }

@Component({
  selector: 'app-depot-setting',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depot-setting.html',
  styleUrl: './depot-setting.scss',
})
export class DepotSetting {
  nomDepot = signal<string>('Dépôt Centrale Akwa');
  adresse = signal<string>('Boulevard de la Liberté, Akwa, Douala, Cameroun');
  description = signal<string>('Hub principal de distribution de boissons pour le secteur Akwa.');

  livraisonActive = signal<boolean>(true);
  retraitActif = signal<boolean>(true);
  fraisLivraison = signal<number>(15000);

  horaires = signal<HoraireJour[]>([
    { jour: 'Lundi', ouvert: true, debut: '08:00', fin: '18:00' },
    { jour: 'Mardi', ouvert: true, debut: '08:00', fin: '18:00' },
    { jour: 'Mercredi', ouvert: true, debut: '08:00', fin: '18:00' },
    { jour: 'Jeudi', ouvert: true, debut: '08:00', fin: '18:00' },
    { jour: 'Vendredi', ouvert: true, debut: '08:00', fin: '18:00' },
    { jour: 'Samedi', ouvert: false, debut: '09:00', fin: '15:00' },
    { jour: 'Dimanche', ouvert: false, debut: '09:00', fin: '12:00' },
  ]);

  enregistrer() {
    console.log('Paramètres enregistrés :', {
      nom: this.nomDepot(), adresse: this.adresse(), description: this.description(),
      livraisonActive: this.livraisonActive(), retraitActif: this.retraitActif(),
      fraisLivraison: this.fraisLivraison(), horaires: this.horaires(),
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