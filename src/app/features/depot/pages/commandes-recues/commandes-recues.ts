import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

export type StatutCommande = 'EN_ATTENTE' | 'CONFIRMEE' | 'EN_PREPARATION' | 'PRETE_A_RETIRER' | 'EN_ROUTE' | 'TERMINEE' | 'LIVREE';

export interface Commande {
  id: string;
  reference: string;
  client: string;
  montant: number;
  heure: string;
  type: 'Livraison' | 'Retrait';
  nombreArticles: number;
  statut: StatutCommande;
}

interface OptionFiltre {
  valeur: StatutCommande | 'TOUTES';
  label: string;
}

@Component({
  selector: 'app-commandes-recues',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './commandes-recues.html',
  styleUrl: './commandes-recues.scss',
})
export class CommandesRecues {
  recherche = signal<string>('');
  filtreStatut = signal<StatutCommande | 'TOUTES'>('TOUTES');

  filtres: OptionFiltre[] = [
    { valeur: 'TOUTES', label: 'Toutes' },
    { valeur: 'EN_ATTENTE', label: 'En attente' },
    { valeur: 'CONFIRMEE', label: 'Confirmées' },
    { valeur: 'EN_PREPARATION', label: 'En préparation' },
    { valeur: 'EN_ROUTE', label: 'En route' },
    { valeur: 'LIVREE', label: 'Livrées' },
  ];

  commandes = signal<Commande[]>([
    { id: '1', reference: 'FAC-2026-089', client: 'Bistrot du Coin', montant: 45000, heure: '10:45', type: 'Livraison', nombreArticles: 12, statut: 'EN_ATTENTE' },
    { id: '2', reference: 'FAC-2026-088', client: 'Café de la Gare', montant: 12500, heure: '09:30', type: 'Retrait', nombreArticles: 3, statut: 'CONFIRMEE' },
    { id: '3', reference: 'FAC-2026-087', client: 'Restaurant Le Sud', montant: 89000, heure: '08:15', type: 'Livraison', nombreArticles: 24, statut: 'EN_PREPARATION' },
    { id: '4', reference: 'FAC-2026-086', client: "L'Ami Jean", montant: 32000, heure: 'Hier', type: 'Livraison', nombreArticles: 8, statut: 'LIVREE' },
  ]);

  commandesFiltrees = computed(() => {
    const terme = this.recherche().toLowerCase().trim();
    const statut = this.filtreStatut();
    return this.commandes().filter(c => {
      const matchRecherche = c.reference.toLowerCase().includes(terme) || c.client.toLowerCase().includes(terme);
      const matchStatut = statut === 'TOUTES' || c.statut === statut;
      return matchRecherche && matchStatut;
    });
  });

  nbEnAttente = computed(() => this.commandes().filter(c => c.statut === 'EN_ATTENTE').length);

  changerFiltre(statut: StatutCommande | 'TOUTES') { this.filtreStatut.set(statut); }

  labelStatut(statut: StatutCommande): string {
    return this.filtres.find(f => f.valeur === statut)?.label ?? statut;
  }

  getBadgeClass(statut: StatutCommande): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-danger text-white';
      case 'CONFIRMEE': return 'bg-primary text-white';
      case 'EN_PREPARATION': case 'PRETE_A_RETIRER': return 'bg-warning text-dark';
      case 'EN_ROUTE': return 'bg-info text-white';
      case 'TERMINEE': case 'LIVREE': return 'bg-success text-white';
      default: return 'bg-secondary text-white';
    }
  }

  getBorderClass(statut: StatutCommande): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'border-start border-danger border-4';
      case 'CONFIRMEE': return 'border-start border-primary border-4';
      case 'EN_PREPARATION': case 'PRETE_A_RETIRER': return 'border-start border-warning border-4';
      case 'EN_ROUTE': return 'border-start border-info border-4';
      case 'TERMINEE': case 'LIVREE': return 'border-start border-success border-4';
      default: return '';
    }
  }
}