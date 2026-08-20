import { Injectable, computed, signal } from '@angular/core';
import { CartDepotInfo, CartItem, CartState } from '../models/cart.model';

const STORAGE_KEY = 'eventdrink_cart';

function readStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { depot: null, items: [] };
    return JSON.parse(raw) as CartState;
  } catch {
    return { depot: null, items: [] };
  }
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly state = signal<CartState>(readStorage());

  readonly depot = computed(() => this.state().depot);
  readonly items = computed(() => this.state().items);
  readonly totalArticles = computed(() => this.items().reduce((sum, i) => sum + i.quantite, 0));
  readonly sousTotal = computed(() =>
    this.items().reduce((sum, i) => sum + i.prix * i.quantite, 0)
  );
  readonly totalConsignes = computed(() =>
    this.items().reduce((sum, i) => sum + i.montantConsigne * i.quantite, 0)
  );

  isFromOtherDepot(depotId: string): boolean {
    const current = this.state().depot;
    return !!current && current.id !== depotId && this.items().length > 0;
  }

  addItem(depot: CartDepotInfo, item: Omit<CartItem, 'quantite'>, quantite = 1): void {
    this.state.update((s) => {
      const items =
        s.depot?.id === depot.id ? [...s.items] : ([] as CartItem[]);
      const existing = items.find((i) => i.produitDepotId === item.produitDepotId);
      if (existing) {
        existing.quantite += quantite;
      } else {
        items.push({ ...item, quantite });
      }
      const next: CartState = { depot, items };
      this.persist(next);
      return next;
    });
  }

  updateQuantite(produitDepotId: string, quantite: number): void {
    this.state.update((s) => {
      const items = s.items
        .map((i) => (i.produitDepotId === produitDepotId ? { ...i, quantite } : i))
        .filter((i) => i.quantite > 0);
      const next: CartState = { depot: items.length ? s.depot : null, items };
      this.persist(next);
      return next;
    });
  }

  removeItem(produitDepotId: string): void {
    this.updateQuantite(produitDepotId, 0);
  }

  clear(): void {
    const next: CartState = { depot: null, items: [] };
    this.persist(next);
    this.state.set(next);
  }

  private persist(state: CartState): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}
