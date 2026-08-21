import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService
      .login({
        email: this.form.value.email!,
        password: this.form.value.password!,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.redirectByRole(res.user.role);
        },
        error: (err) => {
          this.loading.set(false);
          this.error.set(err?.error?.message ?? 'Identifiants invalides.');
        },
      });
  }

  private redirectByRole(role: Role): void {
    const routeByRole: Record<Role, string> = {
      [Role.CLIENT]: '/client',
      [Role.DEPOT]: '/depot',
      [Role.ADMIN]: '/admin',
    };
    this.router.navigateByUrl(routeByRole[role]);
  }
}
