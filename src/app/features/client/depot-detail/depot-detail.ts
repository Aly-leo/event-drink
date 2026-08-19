import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { DepotsService } from '../../../core/services/depots.service';
import { CartService } from '../../../core/services/cart.service';
import { DepotDetail as DepotDetailModel } from '../../../core/models/depot.model';
import { ProduitDepot } from '../../../core/models/produit.model';

@Component({
  selector: 'app-depot-detail',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './depot-detail.html',
})
export class DepotDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly depotsService = inject(DepotsService);
  readonly cartService = inject(CartService);

  readonly depot = signal<DepotDetailModel | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.depotsService.getDepot(id).subscribe({
      next: (depot) => {
        this.depot.set(depot);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger ce dépôt.');
        this.loading.set(false);
      },
    });
  }

  quantiteDans(pd: ProduitDepot): number {
    return this.cartService.items().find((i) => i.produitDepotId === pd.id)?.quantite ?? 0;
  }

  ajouter(pd: ProduitDepot): void {
    const depot = this.depot();
    if (!depot) return;

    if (this.cartService.isFromOtherDepot(depot.id)) {
      const confirme = window.confirm(
        'Ton panier contient déjà des articles d\'un autre dépôt. Le vider pour ajouter ceux-ci ?'
      );
      if (!confirme) return;
      this.cartService.clear();
    }

    this.cartService.addItem(
      {
        id: depot.id,
        nomCommerce: depot.nomCommerce,
        fraisLivraison: depot.fraisLivraison,
        modeLivraison: depot.modeLivraison,
        modeRetrait: depot.modeRetrait,
      },
      {
        produitDepotId: pd.id,
        nom: pd.produit.nom,
        marque: pd.produit.marque,
        contenance: pd.produit.contenance,
        visuelUrl: pd.produit.visuelUrl,
        prix: pd.prix,
        montantConsigne: pd.montantConsigne,
      }
    );
  }

  retirer(pd: ProduitDepot): void {
    const q = this.quantiteDans(pd);
    if (q <= 1) {
      this.cartService.removeItem(pd.id);
    } else {
      this.cartService.updateQuantite(pd.id, q - 1);
    }
  }

  allerAuPanier(): void {
    this.router.navigateByUrl('/client/panier');
  }
}
