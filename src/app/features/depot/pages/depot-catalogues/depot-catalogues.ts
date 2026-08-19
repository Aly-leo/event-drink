import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type CategorieProduit = 'BIERE_LOCALE' | 'VIN' | 'SPIRITUEUX' | 'SOFT' | 'MATERIEL';

export interface Produit {
  id: number;
  nom: string;
  marque: string;
  format: string;
  categorie: CategorieProduit;
  consignable: boolean;
  consignePrix?: number;
  prix: number;
  disponible: boolean;
  imageUrl: string;
}

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
  recherche = signal('');
  categorieActive = signal<CategorieProduit | 'TOUTES'>('TOUTES');
  statutActif = signal<'TOUS' | 'DISPONIBLE' | 'RUPTURE'>('TOUS');

  categories: OptionCategorie[] = [
    { valeur: 'TOUTES', label: 'Toutes les catégories' },
    { valeur: 'BIERE_LOCALE', label: 'Bière locale' },
    { valeur: 'VIN', label: 'Vin' },
    { valeur: 'SPIRITUEUX', label: 'Spiritueux' },
    { valeur: 'SOFT', label: 'Soft / Gazeuse' },
    { valeur: 'MATERIEL', label: 'Matériel' },
  ];

  imageParDefaut = 'https://placehold.co/64x64/EA580C/FFFFFF?text=%20';
  fraisLivraison = signal(15000);

  appliquerFraisLivraison() {
    console.log('Frais de livraison appliqué :', this.fraisLivraison());
  }

  produits = signal<Produit[]>([
    { id: 1, nom: 'Heineken Blonde', marque: 'Heineken', format: 'Fût 30L', categorie: 'BIERE_LOCALE', consignable: true, consignePrix: 20000, prix: 55000, disponible: true, imageUrl: 'https://placehold.co/64x64/EA580C/FFFFFF?text=H' },
    { id: 2, nom: 'Château Rouge AOP', marque: 'Château Rouge', format: 'Caisse 6x75cl', categorie: 'VIN', consignable: false, prix: 28000, disponible: true, imageUrl: 'https://placehold.co/64x64/7C2D12/FFFFFF?text=V' },
    { id: 3, nom: '33 Export', marque: 'SABC', format: 'Casier de 24', categorie: 'BIERE_LOCALE', consignable: true, consignePrix: 200, prix: 12000, disponible: false, imageUrl: 'https://placehold.co/64x64/EA580C/FFFFFF?text=33' },
    { id: 4, nom: 'Coca-Cola', marque: 'Coca-Cola', format: 'Casier de 24 x 25cl', categorie: 'SOFT', consignable: true, consignePrix: 150, prix: 9500, disponible: true, imageUrl: 'https://placehold.co/64x64/DC2626/FFFFFF?text=C' },
    { id: 5, nom: "Jack Daniel's", marque: "Jack Daniel's", format: 'Bouteille 70cl', categorie: 'SPIRITUEUX', consignable: false, prix: 42000, disponible: true, imageUrl: 'https://placehold.co/64x64/1E293B/FFFFFF?text=JD' },
  ]);

  produitsFiltres = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    const cat = this.categorieActive();
    const statut = this.statutActif();
    return this.produits().filter(p => {
      const matchTerme = !terme || p.nom.toLowerCase().includes(terme) || p.marque.toLowerCase().includes(terme);
      const matchCat = cat === 'TOUTES' ? true : p.categorie === cat;
      const matchStatut = statut === 'TOUS' ? true : (statut === 'DISPONIBLE' ? p.disponible : !p.disponible);
      return matchTerme && matchCat && matchStatut;
    });
  });

  labelCategorie(cat: CategorieProduit | 'TOUTES'): string {
    return this.categories.find(c => c.valeur === cat)?.label ?? cat;
  }

  modalOuverte = signal(false);
  modeEdition = signal(false);
  produitIdEnEdition: number | null = null;
  formulaire: Omit<Produit, 'id'> = this.formulaireVide();

  private formulaireVide(): Omit<Produit, 'id'> {
    return { nom: '', marque: '', format: '', categorie: 'BIERE_LOCALE', consignable: false, consignePrix: 0, prix: 0, disponible: true, imageUrl: '' };
  }

  ouvrirAjout() {
    this.modeEdition.set(false);
    this.produitIdEnEdition = null;
    this.formulaire = this.formulaireVide();
    this.modalOuverte.set(true);
  }

  ouvrirModification(id: number) {
    const produit = this.produits().find(p => p.id === id);
    if (!produit) return;
    this.modeEdition.set(true);
    this.produitIdEnEdition = id;
    const { id: _id, ...reste } = produit;
    this.formulaire = { ...reste };
    this.modalOuverte.set(true);
  }

  fermerModal() { this.modalOuverte.set(false); }

  enregistrerProduit() {
    if (!this.formulaire.nom.trim()) return;
    if (!this.formulaire.consignable) this.formulaire.consignePrix = 0;

    if (this.modeEdition() && this.produitIdEnEdition !== null) {
      this.produits.set(this.produits().map(p => p.id === this.produitIdEnEdition ? { id: p.id, ...this.formulaire } : p));
    } else {
      const nouvelId = Math.max(0, ...this.produits().map(p => p.id)) + 1;
      this.produits.set([...this.produits(), { id: nouvelId, ...this.formulaire }]);
    }
    this.fermerModal();
  }

  toggleDisponibilite(id: number) {
    this.produits.set(this.produits().map(p => p.id === id ? { ...p, disponible: !p.disponible } : p));
  }

  supprimerProduit(id: number) {
    this.produits.set(this.produits().filter(p => p.id !== id));
  }
}