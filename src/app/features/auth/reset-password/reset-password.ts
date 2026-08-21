import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmation')?.value;
  return password && confirmation && password !== confirmation ? { mismatch: true } : null;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPassword {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly success = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  private readonly token = this.route.snapshot.queryParamMap.get('token');

  readonly form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmation: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator }
  );

  constructor() {
    if (!this.token) {
      this.error.set('Lien de réinitialisation invalide. Redemande un email.');
    }
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  submit(): void {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.authService.resetPassword(this.token, this.form.value.password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        setTimeout(() => this.router.navigateByUrl('/auth/login'), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Lien invalide ou expiré, redemande un email.');
      },
    });
  }
}
