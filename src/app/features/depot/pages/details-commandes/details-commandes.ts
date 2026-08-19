import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

interface CommandeArticle { nom: string; sku: string; quantite: number; prixUnitaire: number; total: number; image?: string; icon?: string; }
interface EtapeLivraison { nom: string; date?: string; statut: 'termine' | 'encours' | 'attente'; }

@Component({
  selector: 'app-details-commandes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './details-commandes.html',
  styleUrl: './details-commandes.scss',
})
export class DetailsCommandes {
  private route = inject(ActivatedRoute);
  numeroCommande = this.route.snapshot.paramMap.get('id') ?? 'FAC-2026-001';

  etapesLivraison: EtapeLivraison[] = [
    { nom: 'En attente', date: '12 Août, 08:30', statut: 'termine' },
    { nom: 'Confirmée', date: '12 Août, 09:15', statut: 'termine' },
    { nom: 'En préparation', date: 'En cours au dépôt', statut: 'encours' },
    { nom: 'En route', statut: 'attente' },
    { nom: 'Livrée', statut: 'attente' },
  ];

  articles: CommandeArticle[] = [
    { nom: 'Fût Blonde Artisanal 30L', sku: 'BR-BL-30-ART', quantite: 4, prixUnitaire: 55000, total: 220000, icon: 'bi-cup-straw' },
    { nom: 'Casier Eau Pétillante (24x33cl)', sku: 'WAT-SP-24-33', quantite: 10, prixUnitaire: 9500, total: 95000, icon: 'bi-cup-straw' },
    { nom: 'Gobelets réutilisables (Lot de 100)', sku: 'ACC-CUP-ECO-100', quantite: 5, prixUnitaire: 5000, total: 25000, icon: 'bi-cup' },
  ];

  sousTotal = 340000;
  fraisLivraison = 1500;
  totalTtc = 341500;
  moyenPaiement = 'Mobile Money';
  datePaiement = '12 août 2026';

  depot = {
    nom: 'Depot Centrale Akwa',
    description: 'Hub principal de distribution — secteur Akwa',
    adresse: 'Boulevard de la Liberté, Akwa, Douala',
    telephone: '+237 600 000 002',
    email: 'contact@depot-akwa.eventdrink.test',
  };
}