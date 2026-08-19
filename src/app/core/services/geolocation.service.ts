import { Injectable } from '@angular/core';

export interface Coordonnees {
  lat: number;
  lng: number;
}

// Douala, Akwa — position de repli si la géolocalisation est refusée/indisponible.
export const POSITION_PAR_DEFAUT: Coordonnees = { lat: 4.0511, lng: 9.7015 };

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  private cached: Coordonnees | null = null;

  getPosition(): Promise<{ coords: Coordonnees; isDefault: boolean }> {
    if (this.cached) {
      return Promise.resolve({ coords: this.cached, isDefault: false });
    }

    if (!('geolocation' in navigator)) {
      return Promise.resolve({ coords: POSITION_PAR_DEFAUT, isDefault: true });
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          this.cached = coords;
          resolve({ coords, isDefault: false });
        },
        () => resolve({ coords: POSITION_PAR_DEFAUT, isDefault: true }),
        { timeout: 8000, maximumAge: 300000 }
      );
    });
  }
}
