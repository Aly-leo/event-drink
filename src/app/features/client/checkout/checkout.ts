import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import * as L from 'leaflet';
import { CartService } from '../../../core/services/cart.service';
import { CommandesService } from '../../../core/services/commandes.service';
import { GeolocationService, POSITION_PAR_DEFAUT } from '../../../core/services/geolocation.service';
import { ModeReception } from '../../../core/models/commande.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './checkout.html',
})
export class Checkout implements AfterViewInit, OnDestroy {
  readonly cartService = inject(CartService);
  private readonly commandesService = inject(CommandesService);
  private readonly geolocationService = inject(GeolocationService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  @ViewChild('mapEl') mapElRef?: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;

  readonly ModeReception = ModeReception;
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.group({
    mode: [ModeReception.LIVRAISON, [Validators.required]],
    adresseLivraison: [''],
    instructions: [''],
  });

  constructor() {
    const depot = this.cartService.depot();
    if (depot && !depot.modeLivraison && depot.modeRetrait) {
      this.form.patchValue({ mode: ModeReception.RETRAIT });
    }
  }

  ngAfterViewInit(): void {
    this.geolocationService.getPosition().then(({ coords }) => {
      if (!this.mapElRef) return;
      this.map = L.map(this.mapElRef.nativeElement, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(this.map);
      L.marker([coords.lat, coords.lng]).addTo(this.map);
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  get fraisLivraison(): number {
    const depot = this.cartService.depot();
    return this.form.value.mode === ModeReception.LIVRAISON ? depot?.fraisLivraison ?? 0 : 0;
  }

  get total(): number {
    return this.cartService.sousTotal() + this.cartService.totalConsignes() + this.fraisLivraison;
  }

  submit(): void {
    const depot = this.cartService.depot();
    if (!depot || this.cartService.items().length === 0) return;

    const mode = this.form.value.mode as ModeReception;
    if (mode === ModeReception.LIVRAISON && !this.form.value.adresseLivraison?.trim()) {
      this.form.get('adresseLivraison')?.markAsTouched();
      this.error.set('Adresse de livraison requise.');
      return;
    }

    this.submitting.set(true);
    this.error.set(null);

    this.commandesService
      .create({
        depotId: depot.id,
        mode,
        adresseLivraison: this.form.value.adresseLivraison || undefined,
        instructions: this.form.value.instructions || undefined,
        lignes: this.cartService.items().map((i) => ({
          produitDepotId: i.produitDepotId,
          quantite: i.quantite,
        })),
      })
      .subscribe({
        next: (commande) => {
          this.cartService.clear();
          this.submitting.set(false);
          this.router.navigate(['/client/commandes', commande.id, 'confirmee']);
        },
        error: (err) => {
          this.submitting.set(false);
          this.error.set(err?.error?.message ?? 'Impossible de passer la commande.');
        },
      });
  }
}
