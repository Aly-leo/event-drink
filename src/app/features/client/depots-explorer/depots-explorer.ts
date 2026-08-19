import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import * as L from 'leaflet';
import { DepotsService } from '../../../core/services/depots.service';
import { GeolocationService, POSITION_PAR_DEFAUT, Coordonnees } from '../../../core/services/geolocation.service';
import { Depot } from '../../../core/models/depot.model';

@Component({
  selector: 'app-depots-explorer',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './depots-explorer.html',
})
export class DepotsExplorer implements AfterViewInit, OnDestroy {
  private readonly depotsService = inject(DepotsService);
  private readonly geolocationService = inject(GeolocationService);
  private readonly router = inject(Router);

  @ViewChild('mapEl') mapElRef?: ElementRef<HTMLDivElement>;

  readonly depots = signal<Depot[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly usingFallbackPosition = signal(false);
  readonly rayonKm = signal(10);
  readonly livraisonSeulement = signal(false);
  readonly showMapMobile = signal(false);

  readonly filtered = () =>
    this.livraisonSeulement() ? this.depots().filter((d) => d.modeLivraison) : this.depots();

  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private position: Coordonnees = POSITION_PAR_DEFAUT;

  constructor() {
    effect(() => {
      const list = this.filtered();
      if (this.map && this.markersLayer) {
        this.renderMarkers(list);
      }
    });
  }

  ngAfterViewInit(): void {
    this.geolocationService.getPosition().then(({ coords, isDefault }) => {
      this.position = coords;
      this.usingFallbackPosition.set(isDefault);
      this.initMap();
      this.load();
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.depotsService
      .getDepots({ lat: this.position.lat, lng: this.position.lng, rayonKm: this.rayonKm(), tri: 'distance' })
      .subscribe({
        next: (depots) => {
          this.depots.set(depots);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('Impossible de charger les dépôts.');
          this.loading.set(false);
        },
      });
  }

  ouvrirDepot(depot: Depot): void {
    this.router.navigate(['/client/depots', depot.id]);
  }

  toggleMapMobile(): void {
    this.showMapMobile.update((v) => !v);
    // Le conteneur de la carte etait display:none sur mobile ; Leaflet doit recalculer sa taille.
    setTimeout(() => this.map?.invalidateSize(), 50);
  }

  private initMap(): void {
    if (!this.mapElRef) return;

    this.map = L.map(this.mapElRef.nativeElement, {
      center: [this.position.lat, this.position.lng],
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(this.map);

    L.marker([this.position.lat, this.position.lng], { icon: this.userIcon() })
      .addTo(this.map)
      .bindPopup('Ma position');

    this.markersLayer = L.layerGroup().addTo(this.map);
    this.renderMarkers(this.filtered());
  }

  private renderMarkers(depots: Depot[]): void {
    this.markersLayer?.clearLayers();
    for (const depot of depots) {
      const marker = L.marker([depot.latitude, depot.longitude], { icon: this.depotIcon() });
      marker.bindPopup(`<strong>${depot.nomCommerce}</strong><br>${depot.adresse}`);
      marker.on('click', () => this.ouvrirDepot(depot));
      marker.addTo(this.markersLayer!);
    }
  }

  private depotIcon(): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;border-radius:50%;background:#a33900;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);"></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  private userIcon(): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#545f73;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
  }
}
