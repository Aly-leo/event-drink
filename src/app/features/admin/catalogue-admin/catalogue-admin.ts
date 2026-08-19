import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CatalogueService } from '../../../core/services/catalogue.service';
import { CategorieProduit, Produit } from '../../../core/models/produit.model';

@Component({
  selector: 'app-catalogue-admin',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './catalogue-admin.html',
})
export class CatalogueAdmin {
  private readonly catalogueService = inject(CatalogueService);
  private readonly fb = inject(FormBuilder);

  readonly Categories = Object.values(CategorieProduit);
  readonly categorieLabels: Record<CategorieProduit, string> = {
    [CategorieProduit.BIERE_LOCALE]: 'Bières locales',
    [CategorieProduit.BIERE_IMPORTEE]: 'Bières importées',
    [CategorieProduit.CHAMPAGNE_EFFERVESCENT]: 'Champagnes & effervescents',
    [CategorieProduit.VIN]: 'Vins',
    [CategorieProduit.SANS_ALCOOL]: 'Sans alcool',
  };

  readonly produits = signal<Produit[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly showForm = signal(false);
  readonly submitting = signal(false);
  readonly formError = signal<string | null>(null);

  readonly form = this.fb.group({
    nom: ['', [Validators.required]],
    marque: ['', [Validators.required]],
    contenance: ['', [Validators.required]],
    categorie: [CategorieProduit.BIERE_LOCALE, [Validators.required]],
    visuelUrl: [''],
    estConsignable: [false],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.catalogueService.getProduits().subscribe({
      next: (produits) => {
        this.produits.set(produits);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger le catalogue.');
        this.loading.set(false);
      },
    });
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.formError.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.formError.set(null);

    const value = this.form.getRawValue();

    this.catalogueService
      .createProduit({
        nom: value.nom!,
        marque: value.marque!,
        contenance: value.contenance!,
        categorie: value.categorie!,
        visuelUrl: value.visuelUrl || undefined,
        estConsignable: !!value.estConsignable,
      })
      .subscribe({
        next: (produit) => {
          this.produits.update((list) => [...list, produit].sort((a, b) => a.nom.localeCompare(b.nom)));
          this.submitting.set(false);
          this.showForm.set(false);
          this.form.reset({ categorie: CategorieProduit.BIERE_LOCALE, estConsignable: false });
        },
        error: (err) => {
          this.submitting.set(false);
          this.formError.set(err?.error?.message ?? "Impossible d'ajouter le produit.");
        },
      });
  }
}
