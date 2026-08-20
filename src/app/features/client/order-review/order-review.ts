import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AvisService } from '../../../core/services/avis.service';

@Component({
  selector: 'app-order-review',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './order-review.html',
})
export class OrderReview {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly avisService = inject(AvisService);

  readonly commandeId = this.route.snapshot.paramMap.get('id')!;
  readonly note = signal(0);
  readonly commentaire = signal('');
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly etoiles = [1, 2, 3, 4, 5];

  choisirNote(n: number): void {
    this.note.set(n);
  }

  submit(): void {
    if (this.note() === 0) {
      this.error.set('Choisis une note avant d\'envoyer.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.avisService
      .create({
        commandeId: this.commandeId,
        note: this.note(),
        commentaire: this.commentaire().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.router.navigate(['/client/commandes', this.commandeId]);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? "Impossible d'envoyer ton avis.");
        },
      });
  }
}
