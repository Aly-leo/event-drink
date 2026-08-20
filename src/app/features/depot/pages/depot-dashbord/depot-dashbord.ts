import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommandesService } from '../../../../core/services/commandes.service';
import { Commande, StatutCommande } from '../../../../core/models/commande.model';

const STATUTS_TERMINES: StatutCommande[] = [StatutCommande.TERMINEE, StatutCommande.LIVREE];

@Component({
  selector: 'app-depot-dashbord',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './depot-dashbord.html',
  styleUrl: './depot-dashbord.scss',
})
export class DepotDashbord {
  private readonly commandesService = inject(CommandesService);

  loading = signal(true);
  error = signal<string | null>(null);
  commandes = signal<Commande[]>([]);

  periodesDisponibles: string[] = ["Aujourd'hui", 'Cette semaine', 'Ce mois-ci', 'Ce trimestre', 'Cette année'];
  periodeSelectionnee = signal("Ce mois-ci");

  selectionnerPeriode(periode: string) {
    this.periodeSelectionnee.set(periode);
  }

  private debutPeriode(): Date {
    const maintenant = new Date();
    switch (this.periodeSelectionnee()) {
      case "Aujourd'hui":
        return new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
      case 'Cette semaine': {
        const jour = (maintenant.getDay() + 6) % 7;
        const debut = new Date(maintenant);
        debut.setDate(maintenant.getDate() - jour);
        debut.setHours(0, 0, 0, 0);
        return debut;
      }
      case 'Ce trimestre':
        return new Date(maintenant.getFullYear(), Math.floor(maintenant.getMonth() / 3) * 3, 1);
      case 'Cette année':
        return new Date(maintenant.getFullYear(), 0, 1);
      case 'Ce mois-ci':
      default:
        return new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    }
  }

  commandesPeriode = computed(() => {
    const debut = this.debutPeriode();
    return this.commandes().filter((c) => new Date(c.createdAt) >= debut);
  });

  commandesDuJour = computed(() => {
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);
    return this.commandes().filter((c) => new Date(c.createdAt) >= debutJour).length;
  });

  commandesEnAttente = computed(() => this.commandes().filter((c) => c.statut === StatutCommande.EN_ATTENTE).length);

  totalCommandesPeriode = computed(() => this.commandesPeriode().length);

  volumeTransactionsPeriode = computed(() =>
    this.commandesPeriode()
      .filter((c) => STATUTS_TERMINES.includes(c.statut))
      .reduce((somme, c) => somme + c.montantTotal, 0)
  );

  activitesRecentes = computed(() =>
    [...this.commandes()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  );

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.commandesService.getForMyDepot().subscribe({
      next: (commandes) => {
        this.commandes.set(commandes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les commandes.');
        this.loading.set(false);
      },
    });
  }
}
