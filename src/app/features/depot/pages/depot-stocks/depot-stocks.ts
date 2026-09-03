import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';


export type CategorieProduit = 'BIERE_LOCALE' | 'VIN' | 'SPIRITUEUX' | 'SOFT' | 'MATERIEL';
export type TypeMouvement = 'ENTREE' | 'SORTIE';

export interface ProduitStock {
  id: number;
  nom: string;
  format: string;
  categorie: CategorieProduit;
  quantiteActuelle: number;
  seuilAlerte: number;
  imageUrl: string;
}

export interface MouvementStock {
  id: number;
  produitId: number;
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


@Component({
  selector: 'app-depot-stocks',
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './depot-stocks.html',
  styleUrl: './depot-stocks.scss',
})
export class DepotStocks {
  recherche = signal('');
  categorieActive = signal<CategorieProduit | 'TOUTES'>('TOUTES');
  afficherUniquementFaibles = signal(false);

  categories: OptionCategorie[] = [
    { valeur: 'TOUTES', label: 'Toutes les catégories' },
    { valeur: 'BIERE_LOCALE', label: 'Bière locale' },
    { valeur: 'VIN', label: 'Vin' },
    { valeur: 'SPIRITUEUX', label: 'Spiritueux' },
    { valeur: 'SOFT', label: 'Soft / Gazeuse' },
    { valeur: 'MATERIEL', label: 'Matériel' },
  ];

  imageParDefaut = 'https://placehold.co/48x48/EA580C/FFFFFF?text=%20';

  produits = signal<ProduitStock[]>([
    { id: 1, nom: 'Heineken Blonde', format: 'Fût 30L', categorie: 'BIERE_LOCALE', quantiteActuelle: 18, seuilAlerte: 10, imageUrl: 'https://placehold.co/48x48/EA580C/FFFFFF?text=H' },
    { id: 2, nom: 'Château Rouge AOP', format: 'Caisse 6x75cl', categorie: 'VIN', quantiteActuelle: 4, seuilAlerte: 5, imageUrl: 'https://placehold.co/48x48/7C2D12/FFFFFF?text=V' },
    { id: 3, nom: '33 Export', format: 'Casier de 24', categorie: 'BIERE_LOCALE', quantiteActuelle: 32, seuilAlerte: 15, imageUrl: 'https://placehold.co/48x48/EA580C/FFFFFF?text=33' },
    { id: 4, nom: 'Coca-Cola', format: 'Casier de 24 x 25cl', categorie: 'SOFT', quantiteActuelle: 2, seuilAlerte: 8, imageUrl: 'https://placehold.co/48x48/DC2626/FFFFFF?text=C' },
    { id: 5, nom: "Jack Daniel's", format: 'Bouteille 70cl', categorie: 'SPIRITUEUX', quantiteActuelle: 11, seuilAlerte: 3, imageUrl: 'https://placehold.co/48x48/1E293B/FFFFFF?text=JD' },
  ]);

  historique = signal<MouvementStock[]>([
    { id: 1, produitId: 3, produitNom: '33 Export', type: 'ENTREE', quantite: 20, motif: 'Réapprovisionnement fournisseur', date: '18/08/2026 14:20' },
    { id: 2, produitId: 4, produitNom: 'Coca-Cola', type: 'SORTIE', quantite: 15, motif: 'Vente commande FAC-2026-089', date: '18/08/2026 10:05' },
  ]);

  produitsFiltres = computed(() => {
    const terme = this.recherche().trim().toLowerCase();
    const cat = this.categorieActive();
    const faiblesUniquement = this.afficherUniquementFaibles();
    return this.produits().filter(p => {
      const matchTerme = !terme || p.nom.toLowerCase().includes(terme);
      const matchCat = cat === 'TOUTES' ? true : p.categorie === cat;
      const matchFaible = !faiblesUniquement || p.quantiteActuelle <= p.seuilAlerte;
      return matchTerme && matchCat && matchFaible;
    });
  });

  produitsEnAlerte = computed(() => this.produits().filter(p => p.quantiteActuelle <= p.seuilAlerte));

  labelCategorie(cat: CategorieProduit | 'TOUTES'): string {
    return this.categories.find(c => c.valeur === cat)?.label ?? cat;
  }

  // --- Ajustement rapide +/- ---
  ajusterRapide(id: number, delta: number) {
    this.produits.update(list =>
      list.map(p => p.id === id ? { ...p, quantiteActuelle: Math.max(0, p.quantiteActuelle + delta) } : p)
    );
    // TODO: brancher sur l'endpoint stock une fois disponible côté backend
  }

  // --- Modification du seuil d'alerte ---
  modifierSeuil(id: number, nouveauSeuil: number) {
    this.produits.update(list =>
      list.map(p => p.id === id ? { ...p, seuilAlerte: Math.max(0, nouveauSeuil) } : p)
    );
  }

  // --- Modal mouvement détaillé ---
  modalOuverte = signal(false);
  produitSelectionne = signal<ProduitStock | null>(null);
  formulaireMouvement = { type: 'ENTREE' as TypeMouvement, quantite: 1, motif: '' };

  ouvrirMouvement(produit: ProduitStock) {
    this.produitSelectionne.set(produit);
    this.formulaireMouvement = { type: 'ENTREE', quantite: 1, motif: '' };
    this.modalOuverte.set(true);
  }

  fermerModal() {
    this.modalOuverte.set(false);
    this.produitSelectionne.set(null);
  }

  validerMouvement() {
    const produit = this.produitSelectionne();
    if (!produit || this.formulaireMouvement.quantite <= 0) return;

    const delta = this.formulaireMouvement.type === 'ENTREE'
      ? this.formulaireMouvement.quantite
      : -this.formulaireMouvement.quantite;

    this.produits.update(list =>
      list.map(p => p.id === produit.id ? { ...p, quantiteActuelle: Math.max(0, p.quantiteActuelle + delta) } : p)
    );

    this.historique.update(list => [
      {
        id: Math.max(0, ...list.map(m => m.id)) + 1,
        produitId: produit.id,
        produitNom: produit.nom,
        type: this.formulaireMouvement.type,
        quantite: this.formulaireMouvement.quantite,
        motif: this.formulaireMouvement.motif || (this.formulaireMouvement.type === 'ENTREE' ? 'Réapprovisionnement' : 'Sortie de stock'),
        date: new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      },
      ...list,
    ]);

    this.fermerModal();
    // TODO: brancher sur l'endpoint stock une fois disponible côté backend
  }
}


