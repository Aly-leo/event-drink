// import { Component, computed, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterLink } from '@angular/router';
// import { forkJoin } from 'rxjs';
// import { CatalogueService } from '../../../../core/services/catalogue.service';
// import { DepotsService } from '../../../../core/services/depots.service';
// import { CategorieProduit, Produit, ProduitDepot } from '../../../../core/models/produit.model';

// interface OptionCategorie {
//   valeur: CategorieProduit | 'TOUTES';
//   label: string;
// }

// @Component({
//   selector: 'app-depot-catalogues',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink],
//   templateUrl: './depot-catalogues.html',
//   styleUrl: './depot-catalogues.scss',
// })
// export class DepotCatalogues {
//   private readonly catalogueService = inject(CatalogueService);
//   private readonly depotsService = inject(DepotsService);

//   readonly categorieLabels: Record<CategorieProduit, string> = {
//     [CategorieProduit.BIERE_LOCALE]: 'Bière locale',
//     [CategorieProduit.BIERE_IMPORTEE]: 'Bière importée',
//     [CategorieProduit.CHAMPAGNE_EFFERVESCENT]: 'Champagne / effervescent',
//     [CategorieProduit.VIN]: 'Vin',
//     [CategorieProduit.SANS_ALCOOL]: 'Sans alcool',
//   };

//   readonly categories: OptionCategorie[] = [
//     { valeur: 'TOUTES', label: 'Toutes les catégories' },
//     ...Object.values(CategorieProduit).map((valeur) => ({ valeur, label: this.categorieLabels[valeur] })),
//   ];

//   loading = signal(true);
//   error = signal<string | null>(null);

//   recherche = signal('');
//   categorieActive = signal<CategorieProduit | 'TOUTES'>('TOUTES');
//   statutActif = signal<'TOUS' | 'DISPONIBLE' | 'RUPTURE'>('TOUS');

//   catalogueCentral = signal<Produit[]>([]);
//   mesProduits = signal<ProduitDepot[]>([]);

//   produitsFiltres = computed(() => {
//     const terme = this.recherche().trim().toLowerCase();
//     const cat = this.categorieActive();
//     const statut = this.statutActif();
//     return this.mesProduits().filter((pd) => {
//       const matchTerme =
//         !terme || pd.produit.nom.toLowerCase().includes(terme) || pd.produit.marque.toLowerCase().includes(terme);
//       const matchCat = cat === 'TOUTES' ? true : pd.produit.categorie === cat;
//       const matchStatut = statut === 'TOUS' ? true : statut === 'DISPONIBLE' ? pd.disponible : !pd.disponible;
//       return matchTerme && matchCat && matchStatut;
//     });
//   });

//   /** Produits du catalogue central pas encore ajoutés à ce dépôt. */
//   produitsDisponiblesAjout = computed(() => {
//     const dejaAjoutes = new Set(this.mesProduits().map((pd) => pd.produitId));
//     return this.catalogueCentral().filter((p) => !dejaAjoutes.has(p.id));
//   });

//   produitSelectionne = computed(() => this.catalogueCentral().find((p) => p.id === this.formulaire.produitId) ?? null);

//   modalOuverte = signal(false);
//   modeEdition = signal(false);
//   submitting = signal(false);
//   formError = signal<string | null>(null);
//   private produitDepotEnEdition: ProduitDepot | null = null;

//   formulaire = { produitId: '', prix: 0, montantConsigne: 0, disponible: true };

//   constructor() {
//     this.load();
//   }

//   load(): void {
//     this.loading.set(true);
//     this.error.set(null);
//     forkJoin([this.catalogueService.getProduits(), this.depotsService.getMyProduits()]).subscribe({
//       next: ([catalogue, mesProduits]) => {
//         this.catalogueCentral.set(catalogue);
//         this.mesProduits.set(mesProduits);
//         this.loading.set(false);
//       },
//       error: () => {
//         this.error.set('Impossible de charger le catalogue.');
//         this.loading.set(false);
//       },
//     });
//   }

//   labelCategorie(cat: CategorieProduit | 'TOUTES'): string {
//     return this.categories.find((c) => c.valeur === cat)?.label ?? cat;
//   }

//   ouvrirAjout(): void {
//     this.modeEdition.set(false);
//     this.produitDepotEnEdition = null;
//     this.formulaire = { produitId: '', prix: 0, montantConsigne: 0, disponible: true };
//     this.formError.set(null);
//     this.modalOuverte.set(true);
//   }

//   ouvrirModification(pd: ProduitDepot): void {
//     this.modeEdition.set(true);
//     this.produitDepotEnEdition = pd;
//     this.formulaire = {
//       produitId: pd.produitId,
//       prix: pd.prix,
//       montantConsigne: pd.montantConsigne,
//       disponible: pd.disponible,
//     };
//     this.formError.set(null);
//     this.modalOuverte.set(true);
//   }

//   fermerModal(): void {
//     this.modalOuverte.set(false);
//   }

//   enregistrer(): void {
//     this.formError.set(null);

//     if (this.modeEdition() && this.produitDepotEnEdition) {
//       this.submitting.set(true);
//       this.depotsService
//         .updateMyProduit(this.produitDepotEnEdition.id, {
//           prix: this.formulaire.prix,
//           montantConsigne: this.formulaire.montantConsigne,
//           disponible: this.formulaire.disponible,
//         })
//         .subscribe({
//           next: (updated) => {
//             this.mesProduits.update((list) => list.map((p) => (p.id === updated.id ? updated : p)));
//             this.submitting.set(false);
//             this.fermerModal();
//           },
//           error: (err) => {
//             this.formError.set(err.error?.message ?? "Impossible d'enregistrer les modifications.");
//             this.submitting.set(false);
//           },
//         });
//       return;
//     }

//     if (!this.formulaire.produitId) {
//       this.formError.set('Choisis un produit du catalogue central.');
//       return;
//     }

//     this.submitting.set(true);
//     this.depotsService
//       .addMyProduit({
//         produitId: this.formulaire.produitId,
//         prix: this.formulaire.prix,
//         montantConsigne: this.formulaire.montantConsigne,
//         disponible: this.formulaire.disponible,
//       })
//       .subscribe({
//         next: (created) => {
//           this.mesProduits.update((list) => [...list, created]);
//           this.submitting.set(false);
//           this.fermerModal();
//         },
//         error: (err) => {
//           this.formError.set(err.error?.message ?? "Impossible d'ajouter ce produit.");
//           this.submitting.set(false);
//         },
//       });
//   }

//   toggleDisponibilite(pd: ProduitDepot): void {
//     this.depotsService.updateMyProduit(pd.id, { disponible: !pd.disponible }).subscribe({
//       next: (updated) => this.mesProduits.update((list) => list.map((p) => (p.id === updated.id ? updated : p))),
//     });
//   }
// }








// import { Component, computed, inject, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterLink } from '@angular/router';
// import { forkJoin } from 'rxjs';
// import { CatalogueService } from '../../../../core/services/catalogue.service';
// import { DepotsService } from '../../../../core/services/depots.service';
// import { CategorieProduit, Produit, ProduitDepot } from '../../../../core/models/produit.model';

// export type VueOnglet = 'CATALOGUE' | 'STOCKS';
// export type TypeMouvement = 'ENTREE' | 'SORTIE';

// interface OptionCategorie {
//   valeur: CategorieProduit | 'TOUTES';
//   label: string;
// }

// export interface MouvementStock {
//   id: number;
//   produitDepotId: string;
//   produitNom: string;
//   type: TypeMouvement;
//   quantite: number;
//   motif: string;
//   date: string;
// }

// @Component({
//   selector: 'app-depot-catalogues-stocks',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterLink],
//   templateUrl: './depot-catalogues.html',
//   styleUrl: './depot-catalogues.scss',
// })

// export class DepotCatalogues {
//   private readonly catalogueService = inject(CatalogueService);
//   private readonly depotsService = inject(DepotsService);

//   // --- Nav / Onglets ---
//   ongletActif = signal<VueOnglet>('CATALOGUE');

//   // --- Configuration des catégories ---
//   readonly categorieLabels: Record<CategorieProduit, string> = {
//     [CategorieProduit.BIERE_LOCALE]: 'Bière locale',
//     [CategorieProduit.BIERE_IMPORTEE]: 'Bière importée',
//     [CategorieProduit.CHAMPAGNE_EFFERVESCENT]: 'Champagne / effervescent',
//     [CategorieProduit.VIN]: 'Vin',
//     [CategorieProduit.SANS_ALCOOL]: 'Sans alcool',
//   };

//   readonly categories: OptionCategorie[] = [
//     { valeur: 'TOUTES', label: 'Toutes les catégories' },
//     ...Object.values(CategorieProduit).map((valeur) => ({ valeur, label: this.categorieLabels[valeur] })),
//   ];

//   // --- États généraux ---
//   loading = signal(true);
//   error = signal<string | null>(null);

//   recherche = signal('');
//   categorieActive = signal<CategorieProduit | 'TOUTES'>('TOUTES');
//   statutActif = signal<'TOUS' | 'DISPONIBLE' | 'RUPTURE'>('TOUS');
//   afficherUniquementFaibles = signal(false);

//   // --- Données ---
//   catalogueCentral = signal<Produit[]>([]);
//   mesProduits = signal<ProduitDepot[]>([]);
//   historiqueMouvements = signal<MouvementStock[]>([]);

//   // --- Produits filtrés ---
//   produitsFiltres = computed(() => {
//     const terme = this.recherche().trim().toLowerCase();
//     const cat = this.categorieActive();
//     const statut = this.statutActif();
//     const faiblesUniquement = this.afficherUniquementFaibles();

//     return this.mesProduits().filter((pd) => {
//       const matchTerme =
//         !terme ||
//         pd.produit.nom.toLowerCase().includes(terme) ||
//         pd.produit.marque.toLowerCase().includes(terme);
//       const matchCat = cat === 'TOUTES' ? true : pd.produit.categorie === cat;
//       const matchStatut =
//         statut === 'TOUS' ? true : statut === 'DISPONIBLE' ? pd.disponible : !pd.disponible;
      
//       const stock = pd.quantiteActuelle ?? 0;
//       const seuil = pd.seuilAlerte ?? 5;
//       const matchFaible = !faiblesUniquement || stock <= seuil;

//       return matchTerme && matchCat && matchStatut && matchFaible;
//     });
//   });

//   produitsDisponiblesAjout = computed(() => {
//     const dejaAjoutes = new Set(this.mesProduits().map((pd) => pd.produitId));
//     return this.catalogueCentral().filter((p) => !dejaAjoutes.has(p.id));
//   });

//   produitsEnAlerte = computed(() => {
//     return this.mesProduits().filter((pd) => (pd.quantiteActuelle ?? 0) <= (pd.seuilAlerte ?? 5));
//   });

//   produitSelectionne = computed(() =>
//     this.catalogueCentral().find((p) => p.id === this.formulaireCatalogue.produitId) ?? null
//   );

//   // --- Modals et Formulaires ---
//   modalCatalogueOuverte = signal(false);
//   modalMouvementOuverte = signal(false);
//   modeEdition = signal(false);
//   submitting = signal(false);
//   formError = signal<string | null>(null);

//   produitDepotEnEdition: ProduitDepot | null = null;
//   formulaireCatalogue = { produitId: '', prix: 0, montantConsigne: 0, disponible: true };
//   formulaireMouvement = { type: 'ENTREE' as TypeMouvement, quantite: 1, motif: '' };

//   constructor() {
//     this.load();
//   }

//   load(): void {
//     this.loading.set(true);
//     this.error.set(null);
//     forkJoin([this.catalogueService.getProduits(), this.depotsService.getMyProduits()]).subscribe({
//       next: ([catalogue, mesProduits]) => {
//         this.catalogueCentral.set(catalogue);
//         // Initialisation par défaut si quantiteActuelle / seuilAlerte ne sont pas fournis par le serveur
//         const produitsFormates = mesProduits.map((p) => ({
//           ...p,
//           quantiteActuelle: p.quantiteActuelle ?? 0,
//           seuilAlerte: p.seuilAlerte ?? 5,
//         }));
//         this.mesProduits.set(produitsFormates);
//         this.loading.set(false);
//       },
//       error: () => {
//         this.error.set('Impossible de charger le catalogue et les stocks.');
//         this.loading.set(false);
//       },
//     });
//   }

//   labelCategorie(cat: CategorieProduit | 'TOUTES'): string {
//     return this.categories.find((c) => c.valeur === cat)?.label ?? cat;
//   }

//   // --- Modals Catalogue ---
//   ouvrirAjout(): void {
//     this.modeEdition.set(false);
//     this.produitDepotEnEdition = null;
//     this.formulaireCatalogue = { produitId: '', prix: 0, montantConsigne: 0, disponible: true };
//     this.formError.set(null);
//     this.modalCatalogueOuverte.set(true);
//   }

//   ouvrirModification(pd: ProduitDepot): void {
//     this.modeEdition.set(true);
//     this.produitDepotEnEdition = pd;
//     this.formulaireCatalogue = {
//       produitId: pd.produitId,
//       prix: pd.prix,
//       montantConsigne: pd.montantConsigne,
//       disponible: pd.disponible,
//     };
//     this.formError.set(null);
//     this.modalCatalogueOuverte.set(true);
//   }

//   fermerModalCatalogue(): void {
//     this.modalCatalogueOuverte.set(false);
//   }

//   enregistrerCatalogue(): void {
//     this.formError.set(null);

//     if (this.modeEdition() && this.produitDepotEnEdition) {
//       this.submitting.set(true);
//       this.depotsService
//         .updateMyProduit(this.produitDepotEnEdition.id, {
//           prix: this.formulaireCatalogue.prix,
//           montantConsigne: this.formulaireCatalogue.montantConsigne,
//           disponible: this.formulaireCatalogue.disponible,
//         })
//         .subscribe({
//           next: (updated) => {
//             this.mesProduits.update((list) =>
//               list.map((p) => (p.id === updated.id ? { ...p, ...updated } : p))
//             );
//             this.submitting.set(false);
//             this.fermerModalCatalogue();
//           },
//           error: (err) => {
//             this.formError.set(err.error?.message ?? "Impossible d'enregistrer les modifications.");
//             this.submitting.set(false);
//           },
//         });
//       return;
//     }

//     if (!this.formulaireCatalogue.produitId) {
//       this.formError.set('Choisis un produit du catalogue central.');
//       return;
//     }

//     this.submitting.set(true);
//     this.depotsService
//       .addMyProduit({
//         produitId: this.formulaireCatalogue.produitId,
//         prix: this.formulaireCatalogue.prix,
//         montantConsigne: this.formulaireCatalogue.montantConsigne,
//         disponible: this.formulaireCatalogue.disponible,
//       })
//       .subscribe({
//         next: (created) => {
//           this.mesProduits.update((list) => [
//             ...list,
//             { ...created, quantiteActuelle: 0, seuilAlerte: 5 },
//           ]);
//           this.submitting.set(false);
//           this.fermerModalCatalogue();
//         },
//         error: (err) => {
//           this.formError.set(err.error?.message ?? "Impossible d'ajouter ce produit.");
//           this.submitting.set(false);
//         },
//       });
//   }

//   toggleDisponibilite(pd: ProduitDepot): void {
//     const nouvelleDispo = !pd.disponible;
//     this.depotsService.updateMyProduit(pd.id, { disponible: nouvelleDispo }).subscribe({
//       next: (updated) =>
//         this.mesProduits.update((list) =>
//           list.map((p) => (p.id === updated.id ? { ...p, disponible: updated.disponible } : p))
//         ),
//     });
//   }

//   // --- Gestion du Stock & Mouvements ---
//   ouvrirModalMouvement(pd: ProduitDepot): void {
//     this.produitDepotEnEdition = pd;
//     this.formulaireMouvement = { type: 'ENTREE', quantite: 1, motif: '' };
//     this.modalMouvementOuverte.set(true);
//   }

//   fermerModalMouvement(): void {
//     this.modalMouvementOuverte.set(false);
//     this.produitDepotEnEdition = null;
//   }

//   validerMouvement(): void {
//     const pd = this.produitDepotEnEdition;
//     if (!pd || this.formulaireMouvement.quantite <= 0) return;

//     const qteActuelle = pd.quantiteActuelle ?? 0;
//     const delta =
//       this.formulaireMouvement.type === 'ENTREE'
//         ? this.formulaireMouvement.quantite
//         : -this.formulaireMouvement.quantite;

//     const nouvelleQuantite = Math.max(0, qteActuelle + delta);

//     // Mettre à jour le stock en local
//     this.mesProduits.update((list) =>
//       list.map((item) =>
//         item.id === pd.id ? { ...item, quantiteActuelle: nouvelleQuantite } : item
//       )
//     );

//     // Ajout à l'historique
//     this.historiqueMouvements.update((hist) => [
//       {
//         id: Date.now(),
//         produitDepotId: pd.id,
//         produitNom: pd.produit.nom,
//         type: this.formulaireMouvement.type,
//         quantite: this.formulaireMouvement.quantite,
//         motif:
//           this.formulaireMouvement.motif ||
//           (this.formulaireMouvement.type === 'ENTREE' ? 'Réapprovisionnement' : 'Sortie de stock'),
//         date: new Date().toLocaleString('fr-FR', {
//           day: '2-digit',
//           month: '2-digit',
//           year: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit',
//         }),
//       },
//       ...hist,
//     ]);

//     // SYNCHRONISATION AUTOMATIQUE : Si le stock passe de 0 à >0 et le produit était indisponible
//     if (nouvelleQuantite > 0 && !pd.disponible) {
//       this.depotsService.updateMyProduit(pd.id, { disponible: true }).subscribe({
//         next: (updated) => {
//           this.mesProduits.update((list) =>
//             list.map((item) => (item.id === pd.id ? { ...item, disponible: true } : item))
//           );
//         },
//       });
//     }

//     this.fermerModalMouvement();
//   }

//   ajusterStockRapide(pd: ProduitDepot, delta: number): void {
//     const qteActuelle = pd.quantiteActuelle ?? 0;
//     const nouvelleQuantite = Math.max(0, qteActuelle + delta);

//     this.mesProduits.update((list) =>
//       list.map((item) =>
//         item.id === pd.id ? { ...item, quantiteActuelle: nouvelleQuantite } : item
//       )
//     );

//     if (nouvelleQuantite > 0 && !pd.disponible) {
//       this.depotsService.updateMyProduit(pd.id, { disponible: true }).subscribe({
//         next: (updated) => {
//           this.mesProduits.update((list) =>
//             list.map((item) => (item.id === pd.id ? { ...item, disponible: true } : item))
//           );
//         },
//       });
//     }
//   }

//   modifierSeuilAlerte(pd: ProduitDepot, nouveauSeuil: number): void {
//     this.mesProduits.update((list) =>
//       list.map((item) =>
//         item.id === pd.id ? { ...item, seuilAlerte: Math.max(0, nouveauSeuil) } : item
//       )
//     );
//   }
// }



import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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

// Extension locale pour la gestion du stock côté IHM
export interface ProduitDepotAvecStock extends ProduitDepot {
  quantiteActuelle: number;
  seuilAlerte: number;
}

@Component({
  selector: 'app-depot-catalogues',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  // Historique des mouvements (géré en local)
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

  /** Produits du catalogue central pas encore ajoutés à ce dépôt. */
  produitsDisponiblesAjout = computed(() => {
    const dejaAjoutes = new Set(this.mesProduits().map((pd) => pd.produitId));
    return this.catalogueCentral().filter((p) => !dejaAjoutes.has(p.id));
  });

  produitSelectionneForm = computed(() => this.catalogueCentral().find((p) => p.id === this.formulaire.produitId) ?? null);

  // Modals & Formulaires
  modalProduitOuverte = signal(false);
  modalMouvementOuverte = signal(false);
  modeEdition = signal(false);
  submitting = signal(false);
  formError = signal<string | null>(null);

  private produitDepotEnEdition: ProduitDepotAvecStock | null = null;
  produitSelectionneMouvement = signal<ProduitDepotAvecStock | null>(null);

  formulaire = { produitId: '', prix: 0, montantConsigne: 0, disponible: true, quantiteInitial: 0, seuilAlerte: 5 };
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
        // Map local pour initialiser les champs de stock si non fournis par l'API
        this.mesProduits.set(
          mesProduits.map((p) => ({
            ...p,
            quantiteActuelle: (p as any).quantiteActuelle ?? 10,
            seuilAlerte: (p as any).seuilAlerte ?? 5,
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

  // --- Gestion du produit (Ajout / Edition) ---
  ouvrirAjout(): void {
    this.modeEdition.set(false);
    this.produitDepotEnEdition = null;
    this.formulaire = { produitId: '', prix: 0, montantConsigne: 0, disponible: true, quantiteInitial: 0, seuilAlerte: 5 };
    this.formError.set(null);
    this.modalProduitOuverte.set(true);
  }

  ouvrirModification(pd: ProduitDepotAvecStock): void {
    this.modeEdition.set(true);
    this.produitDepotEnEdition = pd;
    this.formulaire = {
      produitId: pd.produitId,
      prix: pd.prix,
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
            this.mesProduits.update((list) =>
              list.map((p) =>
                p.id === updated.id
                  ? {
                      ...p,
                      ...updated,
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
        montantConsigne: this.formulaire.montantConsigne,
        disponible: this.formulaire.disponible,
      })
      .subscribe({
        next: (created) => {
          const nouveauProduit: ProduitDepotAvecStock = {
            ...created,
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

  // --- Actions rapides de stock ---
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

  // --- Modal Mouvement Détaillé ---
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