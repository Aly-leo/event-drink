import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ArticlePanier {
  id: number;
  nom: string;
  prixUnitaire: number;
  quantite: number;
  depot: string;
}

@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './panier.html',
  styleUrl: './panier.scss'
})
export class Panier {
  articles: ArticlePanier[] = [
    { id: 1, nom: 'Bière 65cl (casier)', prixUnitaire: 12000, quantite: 2, depot: 'Dépôt Centrale Akwa' },
    { id: 2, nom: 'Vin rouge', prixUnitaire: 3000, quantite: 5, depot: 'Distri-Boissons Deido' },
    { id: 3, nom: 'Jus / Soft (pack)', prixUnitaire: 4500, quantite: 3, depot: 'Dépôt Centrale Akwa' },
  ];

  fraisLivraison = 1500;

  augmenter(article: ArticlePanier) {
    article.quantite++;
  }

  diminuer(article: ArticlePanier) {
    if (article.quantite > 1) article.quantite--;
  }

  supprimer(article: ArticlePanier) {
    this.articles = this.articles.filter(a => a.id !== article.id);
  }

  sousTotalPour(article: ArticlePanier): number {
    return article.prixUnitaire * article.quantite;
  }

  get sousTotal(): number {
    return this.articles.reduce((total, a) => total + this.sousTotalPour(a), 0);
  }

  get total(): number {
    return this.sousTotal + (this.articles.length > 0 ? this.fraisLivraison : 0);
  }
}
