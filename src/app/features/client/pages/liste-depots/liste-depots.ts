import { Component, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

interface Depot {
  id: number;
  nom: string;
  adresse: string;
  lat: number;
  lng: number;
  prix: number;
  note: number;
  tags: string[];
}

@Component({
  selector: 'app-liste-depots',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './liste-depots.html',
  styleUrl: './liste-depots.scss'
})
export class ListeDepots implements AfterViewInit {
  depots: Depot[] = [
    { id: 1, nom: 'Dépôt Centrale Akwa', adresse: 'Boulevard de la Liberté, Akwa', lat: 4.0511, lng: 9.7679, prix: 500, note: 4.8, tags: ['Castel', 'Kadji', 'Guinness'] },
    { id: 2, nom: 'Distri-Boissons Deido', adresse: 'Rue des Écoles, Deido', lat: 4.0833, lng: 9.7333, prix: 1000, note: 4.5, tags: ['Promo', 'Vins', 'Softs'] },
    { id: 3, nom: 'Bonapriso Drinks Hub', adresse: 'Avenue Njo-Njo', lat: 4.0428, lng: 9.6944, prix: 800, note: 4.2, tags: ['Vins'] },
  ];

  categories = ['Tous', 'Bières Locales', 'Vins', 'Softs'];
  categorieActive = 'Tous';

  map!: L.Map;
  markers: L.Marker[] = [];
  positionUtilisateur: { lat: number; lng: number } | null = null;
  rayonKm = 5;
  triPar: 'prix' | 'distance' = 'distance';

  ngAfterViewInit() {
    this.map = L.map('carte').setView([4.0511, 9.7679], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    this.afficherMarqueurs(this.depots);
  }

  afficherMarqueurs(depots: Depot[]) {
    this.markers.forEach(m => this.map.removeLayer(m));
    this.markers = [];
    depots.forEach(depot => {
      const marker = L.marker([depot.lat, depot.lng])
        .addTo(this.map)
        .bindPopup(`<b>${depot.nom}</b><br>${depot.prix} FCFA`);
      this.markers.push(marker);
    });
  }

  localiserUtilisateur() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.positionUtilisateur = { lat: position.coords.latitude, lng: position.coords.longitude };
        this.filtrerEtTrier();
      });
    }
  }

  distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  distancePour(d: Depot): number | null {
    return this.positionUtilisateur
      ? this.distanceKm(this.positionUtilisateur.lat, this.positionUtilisateur.lng, d.lat, d.lng)
      : null;
  }

  get depotsFiltres(): Depot[] {
    let resultat = [...this.depots];

    if (this.categorieActive !== 'Tous') {
      resultat = resultat.filter(d => d.tags.includes(this.categorieActive));
    }

    if (this.positionUtilisateur) {
      resultat = resultat.filter(d => (this.distancePour(d) ?? 0) <= this.rayonKm);
    }

    if (this.triPar === 'prix') {
      resultat.sort((a, b) => a.prix - b.prix);
    } else if (this.positionUtilisateur) {
      resultat.sort((a, b) => (this.distancePour(a) ?? 0) - (this.distancePour(b) ?? 0));
    }

    return resultat;
  }

  filtrerEtTrier() {
    this.afficherMarqueurs(this.depotsFiltres);
  }

  choisirCategorie(cat: string) {
    this.categorieActive = cat;
    this.filtrerEtTrier();
  }
}
