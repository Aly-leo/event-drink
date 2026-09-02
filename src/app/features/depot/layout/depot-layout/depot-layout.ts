import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet ,Router} from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface LienNav {
  label: string;
  route: string;
  icone: string;
}

@Component({
  selector: 'app-depot-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './depot-layout.html',
  styleUrl: './depot-layout.scss',
})
export class DepotLayout {
   liensNav: LienNav[] = [
    { label: 'Tableau de bord', route: '/depot/dashboard', icone: 'bi-speedometer2' },
    { label: 'Catalogue', route: '/depot/catalogues', icone: 'bi-box-seam' },
    { label: 'Commandes', route: '/depot/commandes', icone: 'bi-cart3' },
    { label: 'Abonnement', route: '/depot/abonnement', icone: 'bi-credit-card' },
    { label: 'Consignes', route: '/depot/consignes', icone: 'bi-arrow-repeat' },
    { label: 'Stocks', route: '/depot/stocks', icone: 'bi-boxes' },
    { label: 'Paramètres', route: '/depot/setting', icone: 'bi-gear' },
  ];

  liensNavMobile: LienNav[] = [
    { label: 'Accueil', route: '/depot/dashboard', icone: 'bi-speedometer2' },
    { label: 'Catalogue', route: '/depot/catalogues', icone: 'bi-box-seam' },
    { label: 'Commandes', route: '/depot/commandes', icone: 'bi-cart3' },
    { label: 'Abonnement', route: '/depot/abonnement', icone: 'bi-credit-card' },
    { label: 'Consignes', route: '/depot/consignes', icone: 'bi-arrow-repeat' },
    { label: 'Stocks', route: '/depot/stocks', icone: 'bi-boxes' },
    { label: 'Compte', route: '/depot/compte', icone: 'bi-person' },
  ];

  constructor(protected authService: AuthService, private router: Router) {}

  deconnexion(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}