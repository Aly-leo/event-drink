import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './cart.html',
})
export class Cart {
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  incrementer(produitDepotId: string, quantite: number): void {
    this.cartService.updateQuantite(produitDepotId, quantite + 1);
  }

  decrementer(produitDepotId: string, quantite: number): void {
    if (quantite <= 1) {
      this.cartService.removeItem(produitDepotId);
    } else {
      this.cartService.updateQuantite(produitDepotId, quantite - 1);
    }
  }

  passerCommande(): void {
    this.router.navigateByUrl('/client/checkout');
  }
}
