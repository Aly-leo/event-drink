import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './account.html',
})
export class Account {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly currentUser = this.authService.currentUser;
  readonly editing = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    nom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    adresse: [''],
  });

  toggleEdition(): void {
    const willEdit = !this.editing();
    this.editing.set(willEdit);
    this.error.set(null);
    if (willEdit) {
      const user = this.currentUser();
      this.form.setValue({
        nom: user?.nom ?? '',
        email: user?.email ?? '',
        telephone: user?.telephone ?? '',
        adresse: user?.adresse ?? '',
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();

    this.authService
      .updateProfile({
        nom: value.nom!,
        email: value.email!,
        telephone: value.telephone || undefined,
        adresse: value.adresse || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.editing.set(false);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? 'Impossible d\'enregistrer tes informations.');
        },
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/auth/login');
  }
}
