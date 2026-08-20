import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DepotsService } from '../../../core/services/depots.service';
import { CartService } from '../../../core/services/cart.service';
import { Depot, DepotDetail } from '../../../core/models/depot.model';
import { CategorieProduit, ProduitDepot } from '../../../core/models/produit.model';

interface CategorieInfo {
  value: CategorieProduit;
  label: string;
}

interface TypeEvenement {
  value: string;
  label: string;
}

interface LigneSaisie {
  id: number;
  categorie: CategorieProduit;
  nomSaisi: string;
  quantite: number;
  quantiteModifieeManuellement: boolean;
}

@Component({
  selector: 'app-calculateur',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculateur.html',
})
export class Calculateur {
  private readonly depotsService = inject(DepotsService);
  private readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  readonly typesEvenement: TypeEvenement[] = [
    { value: 'mariage', label: 'Mariage' },
    { value: 'anniversaire', label: 'Anniversaire' },
    { value: 'soiree', label: 'Soirée' },
  ];

  readonly categories: CategorieInfo[] = [
    { value: CategorieProduit.BIERE_LOCALE, label: 'Bières locales' },
    { value: CategorieProduit.BIERE_IMPORTEE, label: 'Bières importées' },
    { value: CategorieProduit.CHAMPAGNE_EFFERVESCENT, label: 'Champagnes & effervescents' },
    { value: CategorieProduit.VIN, label: 'Vins' },
    { value: CategorieProduit.SANS_ALCOOL, label: 'Sans alcool' },
  ];

  // Ratios par defaut (bouteilles/personne) — a valider en equipe, cf. CLAUDE.md section calculateur.
  private readonly ratioParCategorie: Record<CategorieProduit, number> = {
    [CategorieProduit.BIERE_LOCALE]: 0.5,
    [CategorieProduit.BIERE_IMPORTEE]: 0.3,
    [CategorieProduit.CHAMPAGNE_EFFERVESCENT]: 0.1,
    [CategorieProduit.VIN]: 0.15,
    [CategorieProduit.SANS_ALCOOL]: 0.3,
  };

  // --- Etape 0 : choix du depot (necessaire pour les vrais prix/consignes) ---
  readonly depots = signal<Depot[]>([]);
  readonly loadingDepots = signal(true);
  readonly depotSelectionne = signal<DepotDetail | null>(null);
  readonly loadingCatalogue = signal(false);

  // --- Parametres evenement ---
  typeEvenement = signal('mariage');
  nombreInvites = signal(150);
  marge = signal(10);

  categoriesSelectionnees = signal<CategorieProduit[]>([]);
  lignes = signal<LigneSaisie[]>([]);

  private prochainLigneId = 1;

  constructor() {
    this.depotsService.getDepots().subscribe({
      next: (depots) => {
        this.depots.set(depots);
        this.loadingDepots.set(false);
      },
      error: () => this.loadingDepots.set(false),
    });
  }

  get inviteExtra(): number {
    return Math.ceil(this.nombreInvites() * (this.marge() / 100));
  }

  choisirDepot(depotId: string): void {
    if (!depotId) {
      this.depotSelectionne.set(null);
      return;
    }
    this.loadingCatalogue.set(true);
    this.categoriesSelectionnees.set([]);
    this.lignes.set([]);
    this.depotsService.getDepot(depotId).subscribe({
      next: (depot) => {
        this.depotSelectionne.set(depot);
        this.loadingCatalogue.set(false);
      },
      error: () => this.loadingCatalogue.set(false),
    });
  }

  toggleCategorie(cat: CategorieProduit): void {
    const actuelles = this.categoriesSelectionnees();
    if (actuelles.includes(cat)) {
      this.categoriesSelectionnees.set(actuelles.filter((c) => c !== cat));
      this.lignes.set(this.lignes().filter((l) => l.categorie !== cat));
    } else {
      this.categoriesSelectionnees.set([...actuelles, cat]);
      this.ajouterLigne(cat);
    }
  }

  produitsDeCategorie(cat: CategorieProduit): ProduitDepot[] {
    return (this.depotSelectionne()?.produits ?? []).filter(
      (pd) => pd.produit.categorie === cat && pd.disponible
    );
  }

  lignesDeCategorie(cat: CategorieProduit): LigneSaisie[] {
    return this.lignes().filter((l) => l.categorie === cat);
  }

  ajouterLigne(cat: CategorieProduit): void {
    const nouvelleLigne: LigneSaisie = {
      id: this.prochainLigneId++,
      categorie: cat,
      nomSaisi: '',
      quantite: 0,
      quantiteModifieeManuellement: false,
    };
    this.lignes.set([...this.lignes(), nouvelleLigne]);
  }

  supprimerLigne(id: number): void {
    this.lignes.set(this.lignes().filter((l) => l.id !== id));
  }

  onNomChange(ligneId: number, valeur: string): void {
    this.lignes.set(this.lignes().map((l) => (l.id === ligneId ? { ...l, nomSaisi: valeur } : l)));
    this.recalculerSuggestions();
  }

  onQuantiteChange(ligneId: number, valeur: number): void {
    this.lignes.set(
      this.lignes().map((l) => (l.id === ligneId ? { ...l, quantite: valeur, quantiteModifieeManuellement: true } : l))
    );
  }

  produitReconnu(nomSaisi: string, categorie: CategorieProduit): ProduitDepot | undefined {
    const nom = nomSaisi.trim().toLowerCase();
    if (!nom) return undefined;
    return this.produitsDeCategorie(categorie).find((pd) => pd.produit.nom.toLowerCase() === nom);
  }

  private recalculerSuggestions(): void {
    const invites = this.nombreInvites();
    const facteurMarge = 1 + this.marge() / 100;

    for (const cat of this.categoriesSelectionnees()) {
      const lignesCat = this.lignesDeCategorie(cat).filter((l) => this.produitReconnu(l.nomSaisi, cat));
      if (lignesCat.length === 0) continue;

      const ratio = this.ratioParCategorie[cat] ?? 0;
      const bouteillesTotal = invites * ratio * facteurMarge;
      const bouteillesParLigne = bouteillesTotal / lignesCat.length;

      for (const l of lignesCat) {
        if (l.quantiteModifieeManuellement) continue;
        const qte = Math.ceil(bouteillesParLigne);
        this.lignes.set(this.lignes().map((x) => (x.id === l.id ? { ...x, quantite: qte } : x)));
      }
    }
  }

  readonly lignesReconnues = computed(() =>
    this.lignes()
      .map((l) => ({ ligne: l, produit: this.produitReconnu(l.nomSaisi, l.categorie) }))
      .filter((x) => x.produit)
  );

  readonly prixBoissons = computed(() =>
    this.lignesReconnues().reduce((total, { ligne, produit }) => total + ligne.quantite * produit!.prix, 0)
  );

  readonly montantConsignes = computed(() =>
    this.lignesReconnues().reduce(
      (total, { ligne, produit }) => total + ligne.quantite * produit!.montantConsigne,
      0
    )
  );

  readonly prixTotal = computed(() => this.prixBoissons() + this.montantConsignes());

  appliquerAuPanier(): void {
    const depot = this.depotSelectionne();
    if (!depot || this.lignesReconnues().length === 0) return;

    if (this.cartService.isFromOtherDepot(depot.id)) {
      const confirme = window.confirm(
        "Ton panier contient deja des articles d'un autre depot. Le vider pour appliquer cette estimation ?"
      );
      if (!confirme) return;
      this.cartService.clear();
    }

    const depotInfo = {
      id: depot.id,
      nomCommerce: depot.nomCommerce,
      fraisLivraison: depot.fraisLivraison,
      modeLivraison: depot.modeLivraison,
      modeRetrait: depot.modeRetrait,
    };

    for (const { ligne, produit } of this.lignesReconnues()) {
      this.cartService.addItem(
        depotInfo,
        {
          produitDepotId: produit!.id,
          nom: produit!.produit.nom,
          marque: produit!.produit.marque,
          contenance: produit!.produit.contenance,
          visuelUrl: produit!.produit.visuelUrl,
          prix: produit!.prix,
          montantConsigne: produit!.montantConsigne,
        },
        ligne.quantite
      );
    }

    this.router.navigateByUrl('/client/panier');
  }
}
