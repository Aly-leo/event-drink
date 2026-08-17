import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-depot-inscription',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './depot-inscription.html',
  styleUrl: './depot-inscription.scss'
})
export class DepotInscription {
  private fb = inject(FormBuilder);

  inscriptionForm = this.fb.group({
    nomDepot: ['', Validators.required],
    adresse: ['', Validators.required],
  });

  onSubmit() {
    if (this.inscriptionForm.valid) {
      console.log(this.inscriptionForm.value);
    }
  }
}
