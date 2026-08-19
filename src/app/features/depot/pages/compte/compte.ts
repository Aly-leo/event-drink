import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-compte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './compte.html',
  styleUrl: './compte.scss',
})
export class Compte {
  private authService = inject(AuthService);

  nomComplet = signal(this.authService.currentUser()?.nom ?? '');
  email = signal(this.authService.currentUser()?.email ?? '');
  telephone = signal(this.authService.currentUser()?.telephone ?? '');

  enregistrer(): void {
    console.log('Informations enregistrées :', { nomComplet: this.nomComplet(), email: this.email(), telephone: this.telephone() });
  }
}