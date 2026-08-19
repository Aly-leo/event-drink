import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface ActiviteRecente {
  id: number;
  titre: string;
  auteur: string;
  temps: string;
  icone: string;
  couleur: string;
}

@Component({
  selector: 'app-depot-dashbord',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './depot-dashbord.html',
  styleUrl: './depot-dashbord.scss',
})
export class DepotDashbord {
  periodesDisponibles: string[] = ["Aujourd'hui", 'Cette semaine', 'Ce mois-ci', 'Ce trimestre', 'Cette année'];
  periodeSelectionnee = signal("Ce mois-ci");

  selectionnerPeriode(periode: string) {
    this.periodeSelectionnee.set(periode);
  }

  commandesEnAttente = signal(8);

  kpis = {
    commandesDuJour: 10,
    commandesEnAttente: 8,
    totalCommandes: 50,
    croissanceCommandes: 2.2,
    volumeTransactionsFCFA: 780000,
  };

  activitesRecentes: ActiviteRecente[] = [
    { id: 1, titre: 'Commande de Bistrot du Coin', auteur: 'Nouvelle commande reçue', temps: 'il y a 30 min', icone: 'bi-cart3', couleur: 'primary' },
    { id: 2, titre: 'Consigne restituée', auteur: "L'Ami Jean", temps: 'il y a 5 min', icone: 'bi-arrow-repeat', couleur: 'success' },
  ];

  disponibiliteSysteme = 99;
}