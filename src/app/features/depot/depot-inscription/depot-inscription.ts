import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-depot-inscription',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './depot-inscription.html',
  styleUrls: ['./depot-inscription.scss']
})
export class DepotInscription {
  private fb = inject(FormBuilder);
  inscriptionForm = this.fb.group({
    nom: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', [Validators.minLength(6)]],
    adresse: [''],
    latitude: [null as number | null],
    longitude: [null as number | null],
    fichier: [null as File | null]
  });

  fichierJustificatif: File | null = null;

  localiser() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.inscriptionForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Erreur de géolocalisation', error);
        }
      );
    }
  }

  onFichierSelectionne(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input && input.files && input.files.length) {
      this.fichierJustificatif = input.files[0];
      this.inscriptionForm.patchValue({ fichier: this.fichierJustificatif });
    }
  }

  onSubmit() {
    if (this.inscriptionForm.valid) {
      const value = { ...this.inscriptionForm.value };
      // if needed, attach file separately
      if (this.fichierJustificatif) {
        value.fichier = this.fichierJustificatif;
      }
      console.log(value);
    }
  }

}