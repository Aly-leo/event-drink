import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { CatalogueService } from '../../../../core/services/catalogue.service';
import { DepotsService } from '../../../../core/services/depots.service';
import { CategorieProduit, Produit, ProduitDepot } from '../../../../core/models/produit.model';

export type TypeMouvement = 'ENTREE' | 'SORTIE';

export interface MouvementStock {
  id: number;
  produitId: string;
  produitNom: string;
  type: TypeMouvement;
  quantite: number;
  motif: string;
  date: string;
}

interface OptionCategorie {
  valeur: CategorieProduit | 'TOUTES';
  label: string;
}

export interface ProduitDepotAvecStock extends ProduitDepot {
  quantiteActuelle: number;
  seuilAlerte: number;
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
  afficherUniquementFaibles = signal(false);

  catalogueCentral = signal<Produit[]>([]);
  mesProduits = signal<ProduitDepotAvecStock[]>([]);

  historique = signal<MouvementStock[]>([
    { id: 1, produitId: '1', produitNom: 'Exemple Bière', type: 'ENTREE', quantite: 20, motif: 'Réapprovisionnement', date: '18/08/2026 14:20' }
  ]);

  produitsFiltres = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    const cat = this.categorieActive();
    const statut = this.statutActif();
    const faiblesUniquement = this.afficherUniquementFaibles();

    return this.mesProduits().filter((pd) => {
      const matchTerme =
        !terme || pd.produit.nom.toLowerCase().includes(terme) || pd.produit.marque.toLowerCase().includes(terme);
      const matchCat = cat === 'TOUTES' ? true : pd.produit.categorie === cat;
      const matchStatut = statut === 'TOUS' ? true : statut === 'DISPONIBLE' ? pd.disponible : !pd.disponible;
      const matchFaible = !faiblesUniquement || pd.quantiteActuelle <= pd.seuilAlerte;

      return matchTerme && matchCat && matchStatut && matchFaible;
    });
  });

  produitsEnAlerte = computed(() => this.mesProduits().filter((pd) => pd.quantiteActuelle <= pd.seuilAlerte));

  produitsDisponiblesAjout = computed(() => {
    const dejaAjoutes = new Set(this.mesProduits().map((pd) => pd.produitId));
    return this.catalogueCentral().filter((p) => !dejaAjoutes.has(p.id));
  });

  produitSelectionneForm = computed(() => this.catalogueCentral().find((p) => p.id === this.formulaire.produitId) ?? null);

  modalProduitOuverte = signal(false);
  modalMouvementOuverte = signal(false);
  modeEdition = signal(false);
  submitting = signal(false);
  formError = signal<string | null>(null);

  private produitDepotEnEdition: ProduitDepotAvecStock | null = null;
  produitSelectionneMouvement = signal<ProduitDepotAvecStock | null>(null);

  formulaire = {
    produitId: '',
    prix: 0,
    estConsignable: false,
    montantConsigne: 0,
    disponible: true,
    quantiteInitial: 0,
    seuilAlerte: 5
  };

  formulaireMouvement = { type: 'ENTREE' as TypeMouvement, quantite: 1, motif: '' };

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin([this.catalogueService.getProduits(), this.depotsService.getMyProduits()]).subscribe({
      next: ([catalogue, mesProduits]) => {
        this.catalogueCentral.set(catalogue);
        this.mesProduits.set(
          mesProduits.map((p) => ({
            ...p,
            quantiteActuelle: (p as { quantiteActuelle?: number }).quantiteActuelle ?? 10,
            seuilAlerte: (p as { seuilAlerte?: number }).seuilAlerte ?? 5,
          }))
        );
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

  onSelectProduitAjout(produitId: string): void {
    this.formulaire.produitId = produitId;
    const prodCentral = this.catalogueCentral().find((p) => p.id === produitId);
    if (prodCentral) {
      this.formulaire.estConsignable = prodCentral.estConsignable ?? false;
    }
  }

  ouvrirAjout(): void {
    this.modeEdition.set(false);
    this.produitDepotEnEdition = null;
    this.formulaire = {
      produitId: '',
      prix: 0,
      estConsignable: false,
      montantConsigne: 0,
      disponible: true,
      quantiteInitial: 0,
      seuilAlerte: 5
    };
    this.formError.set(null);
    this.modalProduitOuverte.set(true);
  }

  ouvrirModification(pd: ProduitDepotAvecStock): void {
    this.modeEdition.set(true);
    this.produitDepotEnEdition = pd;

    const estConsignable = pd.montantConsigne > 0 || (pd.produit?.estConsignable ?? false);

    this.formulaire = {
      produitId: pd.produitId,
      prix: pd.prix,
      estConsignable: estConsignable,
      montantConsigne: pd.montantConsigne,
      disponible: pd.disponible,
      quantiteInitial: pd.quantiteActuelle,
      seuilAlerte: pd.seuilAlerte,
    };
    this.formError.set(null);
    this.modalProduitOuverte.set(true);
  }

  fermerModalProduit(): void {
    this.modalProduitOuverte.set(false);
  }

  toggleConsignable(): void {
    this.formulaire.estConsignable = !this.formulaire.estConsignable;
    if (!this.formulaire.estConsignable) {
      this.formulaire.montantConsigne = 0;
    }
  }

  enregistrer(): void {
    this.formError.set(null);
    const consigneFinale = this.formulaire.estConsignable ? this.formulaire.montantConsigne : 0;

    if (this.modeEdition() && this.produitDepotEnEdition) {
      this.submitting.set(true);
      this.depotsService
        .updateMyProduit(this.produitDepotEnEdition.id, {
          prix: this.formulaire.prix,
          montantConsigne: consigneFinale,
          disponible: this.formulaire.disponible,
        })
        .subscribe({
          next: (updated) => {
            this.mesProduits.update((list) =>
              list.map((p) =>
                p.id === updated.id
                  ? {
                      ...p,
                      ...updated,
                      montantConsigne: consigneFinale,
                      seuilAlerte: this.formulaire.seuilAlerte,
                    }
                  : p
              )
            );
            this.submitting.set(false);
            this.fermerModalProduit();
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
        montantConsigne: consigneFinale,
        disponible: this.formulaire.disponible,
      })
      .subscribe({
        next: (created) => {
          const nouveauProduit: ProduitDepotAvecStock = {
            ...created,
            montantConsigne: consigneFinale,
            quantiteActuelle: this.formulaire.quantiteInitial || 0,
            seuilAlerte: this.formulaire.seuilAlerte || 5,
          };
          this.mesProduits.update((list) => [...list, nouveauProduit]);
          this.submitting.set(false);
          this.fermerModalProduit();
        },
        error: (err) => {
          this.formError.set(err.error?.message ?? "Impossible d'ajouter ce produit.");
          this.submitting.set(false);
        },
      });
  }

  toggleDisponibilite(pd: ProduitDepotAvecStock): void {
    this.depotsService.updateMyProduit(pd.id, { disponible: !pd.disponible }).subscribe({
      next: (updated) =>
        this.mesProduits.update((list) =>
          list.map((p) => (p.id === updated.id ? { ...p, disponible: updated.disponible } : p))
        ),
    });
  }

  ajusterRapide(id: string, delta: number): void {
    this.mesProduits.update((list) =>
      list.map((p) => (p.id === id ? { ...p, quantiteActuelle: Math.max(0, p.quantiteActuelle + delta) } : p))
    );
  }

  modifierSeuil(id: string, nouveauSeuil: number): void {
    this.mesProduits.update((list) =>
      list.map((p) => (p.id === id ? { ...p, seuilAlerte: Math.max(0, nouveauSeuil) } : p))
    );
  }

  ouvrirMouvement(produit: ProduitDepotAvecStock): void {
    this.produitSelectionneMouvement.set(produit);
    this.formulaireMouvement = { type: 'ENTREE', quantite: 1, motif: '' };
    this.modalMouvementOuverte.set(true);
  }

  fermerModalMouvement(): void {
    this.modalMouvementOuverte.set(false);
    this.produitSelectionneMouvement.set(null);
  }

  validerMouvement(): void {
    const produit = this.produitSelectionneMouvement();
    if (!produit || this.formulaireMouvement.quantite <= 0) return;

    const delta =
      this.formulaireMouvement.type === 'ENTREE'
        ? this.formulaireMouvement.quantite
        : -this.formulaireMouvement.quantite;

    this.mesProduits.update((list) =>
      list.map((p) => (p.id === produit.id ? { ...p, quantiteActuelle: Math.max(0, p.quantiteActuelle + delta) } : p))
    );

    this.historique.update((list) => [
      {
        id: Math.max(0, ...list.map((m) => m.id)) + 1,
        produitId: produit.id,
        produitNom: produit.produit.nom,
        type: this.formulaireMouvement.type,
        quantite: this.formulaireMouvement.quantite,
        motif:
          this.formulaireMouvement.motif ||
          (this.formulaireMouvement.type === 'ENTREE' ? 'Réapprovisionnement' : 'Sortie de stock'),
        date: new Date().toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
      ...list,
    ]);

    this.fermerModalMouvement();
  }
}
