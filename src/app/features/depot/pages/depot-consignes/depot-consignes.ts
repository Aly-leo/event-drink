import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ConsigneAffichee {
  id: string;
  client: string;
  produit: string;
  montant: number;
  dateCommande: string;
  statut: 'BLOQUEE' | 'REMBOURSEE';
}

@Component({
  selector: 'app-depot-consignes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './depot-consignes.html',
  styleUrl: './depot-consignes.scss',
})
export class DepotConsignes {
  consignes = signal<ConsigneAffichee[]>([
    { id: '1', client: 'Bistrot du Coin', produit: 'Casier Castel Beer 65cl', montant: 3000, dateCommande: '15/08/2026', statut: 'BLOQUEE' },
    { id: '2', client: 'Café de la Gare', produit: 'Bouteille Mützig 65cl', montant: 500, dateCommande: '14/08/2026', statut: 'BLOQUEE' },
    { id: '3', client: "L'Ami Jean", produit: 'Casier 33 Export', montant: 200, dateCommande: '10/08/2026', statut: 'REMBOURSEE' },
  ]);

  consignesBloquees = computed(() => this.consignes().filter(c => c.statut === 'BLOQUEE'));
  totalBloque = computed(() => this.consignesBloquees().reduce((somme, c) => somme + c.montant, 0));

  marquerRestituee(id: string) {
    this.consignes.update(list => list.map(c => c.id === id ? { ...c, statut: 'REMBOURSEE' as const } : c));
    // TODO: brancher sur PATCH /consignes/:id/restituer une fois l'endpoint disponible
  }
}