import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Boisson {
  nom: string;
  ratioParPersonne: number; // en litres ou unités par personne
  prixUnitaire: number;
}

@Component({
  selector: 'app-calculateur',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './calculateur.html',
  styleUrl: './calculateur.scss'
})
export class Calculateur {
  nombreInvites = 50;
  dureeHeures = 4;
  margeSecurite = 15; // en %

  boissons: Boisson[] = [
    { nom: 'Bière', ratioParPersonne: 0.5, prixUnitaire: 700 },
    { nom: 'Vin', ratioParPersonne: 0.2, prixUnitaire: 3000 },
    { nom: 'Soft / Jus', ratioParPersonne: 0.4, prixUnitaire: 500 },
    { nom: 'Eau', ratioParPersonne: 0.5, prixUnitaire: 300 },
  ];

  quantitePour(boisson: Boisson): number {
    const base = this.nombreInvites * boisson.ratioParPersonne * (this.dureeHeures / 4);
    const avecMarge = base * (1 + this.margeSecurite / 100);
    return Math.ceil(avecMarge);
  }

  coutPour(boisson: Boisson): number {
    return this.quantitePour(boisson) * boisson.prixUnitaire;
  }

  get coutTotal(): number {
    return this.boissons.reduce((total, b) => total + this.coutPour(b), 0);
  }
}
