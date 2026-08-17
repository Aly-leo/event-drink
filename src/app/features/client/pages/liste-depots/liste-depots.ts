import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

interface Depot {
  id: number;
  nom: string;
  adresse: string;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-liste-depots',
  standalone: true,
  imports: [],
  templateUrl: './liste-depots.html',
  styleUrl: './liste-depots.scss'
})
export class ListeDepots implements AfterViewInit {
  depots: Depot[] = [
    { id: 1, nom: 'Dépôt Akwa', adresse: 'Akwa, Douala', lat: 4.0511, lng: 9.7679 },
    { id: 2, nom: 'Dépôt Bonamoussadi', adresse: 'Bonamoussadi, Douala', lat: 4.0833, lng: 9.7333 },
    { id: 3, nom: 'Dépôt Bonanjo', adresse: 'Bonanjo, Douala', lat: 4.0428, lng: 9.6944 },
  ];

  ngAfterViewInit() {
    const map = L.map('carte').setView([4.0511, 9.7679], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    this.depots.forEach(depot => {
      L.marker([depot.lat, depot.lng]).addTo(map).bindPopup(depot.nom);
    });
  }
}
