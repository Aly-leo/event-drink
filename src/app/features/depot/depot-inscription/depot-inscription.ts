import { Component, inject, AfterViewInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import * as L from 'leaflet';

// Icône personnalisée (le pin par défaut de Leaflet est cassé avec Angular)
const iconePin = L.divIcon({
  className: 'pin-perso',
  html: `<div class="pin-corps"><div class="pin-point"></div></div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42],
});

@Component({
  selector: 'app-depot-inscription',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './depot-inscription.html',
  styleUrl: './depot-inscription.scss'
})
export class DepotInscription implements AfterViewInit {
  private fb = inject(FormBuilder);
  map!: L.Map;
  marker!: L.Marker;

  inscriptionForm = this.fb.group({
    nomDepot: ['', Validators.required],
    telephone: ['', Validators.required],
    latitude: [4.0511],
    longitude: [9.7679],
    retraitSurPlace: [true],
    livraisonADomicile: [true],
    fraisLivraison: [1500, Validators.required],
  });

  fichierJustificatif: File | null = null;

  ngAfterViewInit() {
    const lat = this.inscriptionForm.value.latitude!;
    const lng = this.inscriptionForm.value.longitude!;

    this.map = L.map('carte-localisation', { zoomControl: false }).setView([lat, lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);

    this.marker = L.marker([lat, lng], { icon: iconePin, draggable: true }).addTo(this.map);

    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng();
      this.inscriptionForm.patchValue({ latitude: pos.lat, longitude: pos.lng });
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.marker.setLatLng(e.latlng);
      this.inscriptionForm.patchValue({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    });
  }

  localiser() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        this.inscriptionForm.patchValue({ latitude, longitude });
        this.marker.setLatLng([latitude, longitude]);
        this.map.setView([latitude, longitude], 15);
      });
    }
  }

  onFichierSelectionne(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.fichierJustificatif = input.files[0];
  }

  onFichierDepose(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files.length) this.fichierJustificatif = event.dataTransfer.files[0];
  }

  onSubmit() {
    if (this.inscriptionForm.valid) console.log(this.inscriptionForm.value);
  }
}