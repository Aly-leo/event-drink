import { Component, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AdminService, AdminStats } from '../../../core/services/admin.service';
import { Depot, StatutDepot } from '../../../core/models/depot.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly adminService = inject(AdminService);

  readonly stats = signal<AdminStats | null>(null);
  readonly depotsEnAttente = signal<Depot[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly actionEnCours = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.adminService.getStats().subscribe({
      next: (stats) => this.stats.set(stats),
      error: () => this.error.set('Impossible de charger les statistiques.'),
    });

    this.adminService.getDepots(StatutDepot.EN_ATTENTE).subscribe({
      next: (depots) => {
        this.depotsEnAttente.set(depots);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger la file de dépôts.');
        this.loading.set(false);
      },
    });
  }

  valider(depot: Depot): void {
    this.actionEnCours.set(depot.id);
    this.adminService.validerDepot(depot.id).subscribe({
      next: () => {
        this.depotsEnAttente.update((list) => list.filter((d) => d.id !== depot.id));
        this.actionEnCours.set(null);
        this.stats.update((s) => (s ? { ...s, depotsActifs: s.depotsActifs + 1, depotsEnAttente: s.depotsEnAttente - 1 } : s));
      },
      error: () => this.actionEnCours.set(null),
    });
  }

  rejeter(depot: Depot): void {
    this.actionEnCours.set(depot.id);
    this.adminService.bloquerDepot(depot.id).subscribe({
      next: () => {
        this.depotsEnAttente.update((list) => list.filter((d) => d.id !== depot.id));
        this.actionEnCours.set(null);
        this.stats.update((s) => (s ? { ...s, depotsEnAttente: s.depotsEnAttente - 1 } : s));
      },
      error: () => this.actionEnCours.set(null),
    });
  }
}
