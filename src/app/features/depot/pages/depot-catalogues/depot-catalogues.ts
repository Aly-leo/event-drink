import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { DepotsService } from '../../../../core/services/depots.service';
import { CategorieProduit, Produit, ProduitDepot } from '../../../../core/models/produit.model';

interface OptionCategorie {
  valeur: CategorieProduit | 'TOUTES';
  label: string;
}

@Component({
  selector: 'app-depot-catalogues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './depot-catalogues.html',
  styleUrl: './depot-catalogues.scss',
})
export class DepotCatalogues {
  private readonly catalogueService = inject(CatalogueService);
  private readonly depotsService = inject(DepotsService);

  readonly categorieLabels: Record<CategorieProduit, string> = {
    [CategorieProduit.BIERE_LOCALE]: 'Bière locale',
    [CategorieProduit.BIERE_IMPORTEE]: 'Bière importée',
    [CategorieProduit.CHAMPAGNE_EFFERVESCENT]: 'Champagne / effervescent',
    [CategorieProduit.VIN]: 'Vin',
    [CategorieProduit.SANS_ALCOOL]: 'Sans alcool',
  };

  readonly categories: OptionCategorie[] = [
    { valeur: 'TOUTES', label: 'Toutes les catégories' },
    ...Object.values(CategorieProduit).map((valeur) => ({ valeur, label: this.categorieLabels[valeur] })),
  ];

  loading = signal(true);
  error = signal<string | null>(null);

  recherche = signal('');
  categorieActive = signal<CategorieProduit | 'TOUTES'>('TOUTES');
  statutActif = signal<'TOUS' | 'DISPONIBLE' | 'RUPTURE'>('TOUS');

  catalogueCentral = signal<Produit[]>([]);
  mesProduits = signal<ProduitDepot[]>([]);

  produitsFiltres = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    const cat = this.categorieActive();
    const statut = this.statutActif();
    return this.mesProduits().filter((pd) => {
      const matchTerme =
        !terme || pd.produit.nom.toLowerCase().includes(terme) || pd.produit.marque.toLowerCase().includes(terme);
      const matchCat = cat === 'TOUTES' ? true : pd.produit.categorie === cat;
      const matchStatut = statut === 'TOUS' ? true : statut === 'DISPONIBLE' ? pd.disponible : !pd.disponible;
      return matchTerme && matchCat && matchStatut;
    });
  });

  /** Produits du catalogue central pas encore ajoutés à ce dépôt. */
  produitsDisponiblesAjout = computed(() => {
    const dejaAjoutes = new Set(this.mesProduits().map((pd) => pd.produitId));
    return this.catalogueCentral().filter((p) => !dejaAjoutes.has(p.id));
  });

  produitSelectionne = computed(() => this.catalogueCentral().find((p) => p.id === this.formulaire.produitId) ?? null);

  modalOuverte = signal(false);
  modeEdition = signal(false);
  submitting = signal(false);
  formError = signal<string | null>(null);
  private produitDepotEnEdition: ProduitDepot | null = null;

  formulaire = { produitId: '', prix: 0, montantConsigne: 0, disponible: true };

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin([this.catalogueService.getProduits(), this.depotsService.getMyProduits()]).subscribe({
      next: ([catalogue, mesProduits]) => {
        this.catalogueCentral.set(catalogue);
        this.mesProduits.set(mesProduits);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le catalogue.');
        this.loading.set(false);
      },
    });
  }

  labelCategorie(cat: CategorieProduit | 'TOUTES'): string {
    return this.categories.find((c) => c.valeur === cat)?.label ?? cat;
  }

  ouvrirAjout(): void {
    this.modeEdition.set(false);
    this.produitDepotEnEdition = null;
    this.formulaire = { produitId: '', prix: 0, montantConsigne: 0, disponible: true };
    this.formError.set(null);
    this.modalOuverte.set(true);
  }

  ouvrirModification(pd: ProduitDepot): void {
    this.modeEdition.set(true);
    this.produitDepotEnEdition = pd;
    this.formulaire = {
      produitId: pd.produitId,
      prix: pd.prix,
      montantConsigne: pd.montantConsigne,
      disponible: pd.disponible,
    };
    this.formError.set(null);
    this.modalOuverte.set(true);
  }

  fermerModal(): void {
    this.modalOuverte.set(false);
  }

  enregistrer(): void {
    this.formError.set(null);

    if (this.modeEdition() && this.produitDepotEnEdition) {
      this.submitting.set(true);
      this.depotsService
        .updateMyProduit(this.produitDepotEnEdition.id, {
          prix: this.formulaire.prix,
          montantConsigne: this.formulaire.montantConsigne,
          disponible: this.formulaire.disponible,
        })
        .subscribe({
          next: (updated) => {
            this.mesProduits.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
            this.submitting.set(false);
            this.fermerModal();
          },
          error: (err) => {
            this.formError.set(err.error?.message ?? "Impossible d'enregistrer les modifications.");
            this.submitting.set(false);
          },
        });
      return;
    }

    if (!this.formulaire.produitId) {
      this.formError.set('Choisis un produit du catalogue central.');
      return;
    }

    this.submitting.set(true);
    this.depotsService
      .addMyProduit({
        produitId: this.formulaire.produitId,
        prix: this.formulaire.prix,
        montantConsigne: this.formulaire.montantConsigne,
        disponible: this.formulaire.disponible,
      })
      .subscribe({
        next: (created) => {
          this.mesProduits.update((list) => [...list, created]);
          this.submitting.set(false);
          this.fermerModal();
        },
        error: (err) => {
          this.formError.set(err.error?.message ?? "Impossible d'ajouter ce produit.");
          this.submitting.set(false);
        },
      });
  }

  toggleDisponibilite(pd: ProduitDepot): void {
    this.depotsService.updateMyProduit(pd.id, { disponible: !pd.disponible }).subscribe({
      next: (updated) => this.mesProduits.update((list) => list.map((p) => (p.id === updated.id ? updated : p))),
    });
  }
}
