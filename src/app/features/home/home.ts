import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../core/models/user.model';

interface Fonctionnalite {
  icone: string;
  titre: string;
  texte: string;
}

interface Etape {
  titre: string;
  texte: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly authService = inject(AuthService);

  /** Espace de l'utilisateur déjà connecté, pour lui éviter de repasser par la connexion. */
  readonly espaceUrl = computed(() => {
    if (!this.authService.isLoggedIn()) {
      return null;
    }
    const routeParRole: Record<Role, string> = {
      [Role.CLIENT]: '/client',
      [Role.DEPOT]: '/depot',
      [Role.ADMIN]: '/admin',
    };
    const role = this.authService.currentUser()?.role;
    return role ? routeParRole[role] : null;
  });

  readonly annee = new Date().getFullYear();

  readonly fonctionnalites: Fonctionnalite[] = [
    {
      icone: 'bi-geo-alt',
      titre: 'Dépôts près de chez vous',
      texte: 'Une carte, la distance, la note des clients et la livraison ou le retrait en un coup d’œil.',
    },
    {
      icone: 'bi-calculator',
      titre: 'Calculateur de quantités',
      texte: 'Indiquez votre événement et le nombre d’invités, on estime les boissons à commander.',
    },
    {
      icone: 'bi-truck',
      titre: 'Suivi de commande',
      texte: 'De la confirmation à la livraison, suivez chaque étape depuis votre téléphone.',
    },
    {
      icone: 'bi-arrow-repeat',
      titre: 'Consignes sous contrôle',
      texte: 'Casiers et bouteilles consignés : le montant bloqué est toujours visible.',
    },
    {
      icone: 'bi-boxes',
      titre: 'Stocks et ventes',
      texte: 'Pour les dépôts : stock, seuils d’alerte, commandes reçues et statistiques de vente.',
    },
    {
      icone: 'bi-star',
      titre: 'Avis des clients',
      texte: 'Après livraison, chacun note son dépôt pour aider les prochains clients à choisir.',
    },
  ];

  readonly etapes: Etape[] = [
    { titre: 'Trouvez un dépôt', texte: 'Explorez la carte et comparez les dépôts proches.' },
    { titre: 'Estimez vos quantités', texte: 'Le calculateur remplit votre panier pour vous.' },
    { titre: 'Commandez', texte: 'Livraison à domicile ou retrait sur place.' },
    { titre: 'Suivez', texte: 'Statut en direct, consignes et avis après livraison.' },
  ];
}
