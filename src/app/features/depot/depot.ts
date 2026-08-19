import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface OnboardingDepotPayload {
  nomCommerce: string;
  telephone: string;
  adresse: string;
  latitude: number;
  longitude: number;
  modeLivraison?: boolean;
  modeRetrait?: boolean;
  fraisLivraison?: number;
}

@Injectable({
  providedIn: 'root',
})

export class Depot {
   private apiUrl = 'http://localhost:3000/depots';

  constructor(private http: HttpClient) {}

  onboarding(payload: OnboardingDepotPayload): Observable<any> {
    return this.http.post(`${this.apiUrl}/onboarding`, payload);
  }
}





