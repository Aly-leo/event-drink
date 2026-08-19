import { Component, computed, inject, signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { PlaintesService } from '../../../core/services/plaintes.service';
import { AdminService } from '../../../core/services/admin.service';
import { ActionAdminPlainte, MotifPlainte, Plainte, StatutPlainte } from '../../../core/models/plainte.model';
import { Depot } from '../../../core/models/depot.model';

@Component({
  selector: 'app-plaintes-admin',
  standalone: true,
  imports: [KeyValuePipe],
  templateUrl: './plaintes-admin.html',
})
export class PlaintesAdmin {
  private readonly plaintesService = inject(PlaintesService);
  private readonly adminService = inject(AdminService);

  readonly ActionAdminPlainte = ActionAdminPlainte;
  readonly StatutPlainte = StatutPlainte;

  readonly motifLabels: Record<MotifPlainte, string> = {
    [MotifPlainte.REFUS_CONSIGNE]: 'Refus de consigne',
    [MotifPlainte.PRODUIT_MANQUANT]: 'Produit manquant',
    [MotifPlainte.PRODUIT_ENDOMMAGE]: 'Produit endommagé',
    [MotifPlainte.RETARD_LIVRAISON]: 'Retard de livraison',
    [MotifPlainte.QUALITE_SERVICE]: 'Qualité de service',
    [MotifPlainte.AUTRE]: 'Autre',
  };

  readonly actionLabels: Record<ActionAdminPlainte, string> = {
    [ActionAdminPlainte.AVERTISSEMENT]: 'Avertissement',
    [ActionAdminPlainte.SUSPENSION_TEMPORAIRE]: 'Suspension temporaire',
    [ActionAdminPlainte.BANNISSEMENT]: 'Bannissement permanent',
  };

  readonly plaintes = signal<Plainte[]>([]);
  readonly depots = signal<Depot[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedId = signal<string | null>(null);
  readonly actionEnCours = signal(false);

  readonly filterDepotId = signal<string>('');
  readonly filterStatut = signal<StatutPlainte | ''>('');
  readonly filterMotif = signal<MotifPlainte | ''>('');

  readonly filtered = computed(() =>
    this.plaintes().filter(
      (p) =>
        (!this.filterDepotId() || p.depotId === this.filterDepotId()) &&
        (!this.filterStatut() || p.statut === this.filterStatut()) &&
        (!this.filterMotif() || p.motif === this.filterMotif())
    )
  );

  readonly selected = () => this.plaintes().find((p) => p.id === this.selectedId()) ?? null;

  constructor() {
    this.load();
    this.adminService.getDepots().subscribe({ next: (depots) => this.depots.set(depots) });
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.plaintesService.getPlaintes().subscribe({
      next: (plaintes) => {
        this.plaintes.set(plaintes);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les plaintes.');
        this.loading.set(false);
      },
    });
  }

  clearFilters(): void {
    this.filterDepotId.set('');
    this.filterStatut.set('');
    this.filterMotif.set('');
  }

  select(plainte: Plainte): void {
    this.selectedId.set(plainte.id);
  }

  resoudre(plainte: Plainte): void {
    this.actionEnCours.set(true);
    this.plaintesService.resoudre(plainte.id).subscribe({
      next: (updated) => {
        this.replace(updated);
        this.actionEnCours.set(false);
      },
      error: () => this.actionEnCours.set(false),
    });
  }

  appliquerAction(plainte: Plainte, action: ActionAdminPlainte): void {
    this.actionEnCours.set(true);
    this.plaintesService.appliquerAction(plainte.id, action).subscribe({
      next: (updated) => {
        this.replace(updated);
        this.actionEnCours.set(false);
      },
      error: () => this.actionEnCours.set(false),
    });
  }

  private replace(updated: Plainte): void {
    this.plaintes.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
  }
}
