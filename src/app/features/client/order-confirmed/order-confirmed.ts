import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommandesService } from '../../../core/services/commandes.service';
import { Commande } from '../../../core/models/commande.model';

@Component({
  selector: 'app-order-confirmed',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './order-confirmed.html',
})
export class OrderConfirmed {
  private readonly route = inject(ActivatedRoute);
  private readonly commandesService = inject(CommandesService);

  readonly commande = signal<Commande | null>(null);
  readonly commandeId = this.route.snapshot.paramMap.get('id')!;

  constructor() {
    this.commandesService.getOne(this.commandeId).subscribe({
      next: (commande) => this.commande.set(commande),
    });
  }
}
