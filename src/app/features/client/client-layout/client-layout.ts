import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './client-layout.html',
})
export class ClientLayout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cartService = inject(CartService);

  readonly currentUser = this.authService.currentUser;
  readonly totalArticles = this.cartService.totalArticles;

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
