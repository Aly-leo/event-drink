import { Component, inject, signal } from '@angular/core';
import { PlaintesService } from '../../../core/services/plaintes.service';
import { ActionAdminPlainte, MotifPlainte, Plainte, StatutPlainte } from '../../../core/models/plainte.model';

@Component({
  selector: 'app-plaintes-admin',
  standalone: true,
  imports: [],
  templateUrl: './plaintes-admin.html',
})
export class PlaintesAdmin {
  private readonly plaintesService = inject(PlaintesService);

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
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedId = signal<string | null>(null);
  readonly actionEnCours = signal(false);

  readonly selected = () => this.plaintes().find((p) => p.id === this.selectedId()) ?? null;

  constructor() {
    this.load();
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
