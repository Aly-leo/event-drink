import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly Role = Role;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    nom: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: [Role.CLIENT, [Validators.required]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();

    this.authService
      .register({
        nom: value.nom!,
        email: value.email!,
        telephone: value.telephone || undefined,
        password: value.password!,
        role: value.role as Role.CLIENT | Role.DEPOT,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          const routeByRole: Record<string, string> = {
            [Role.CLIENT]: '/client',
            [Role.DEPOT]: '/depot',
          };
          this.router.navigateByUrl(routeByRole[res.user.role] ?? '/auth/login');
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Inscription impossible.');
        },
      });
  }
}
