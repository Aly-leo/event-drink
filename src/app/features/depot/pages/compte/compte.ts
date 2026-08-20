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

  submitting = signal(false);
  error = signal<string | null>(null);
  succes = signal(false);

  enregistrer(): void {
    this.submitting.set(true);
    this.error.set(null);
    this.succes.set(false);

    this.authService
      .updateProfile({
        nom: this.nomComplet(),
        email: this.email(),
        telephone: this.telephone() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.succes.set(true);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err.error?.message ?? "Impossible d'enregistrer les modifications.");
        },
      });
  }
}
