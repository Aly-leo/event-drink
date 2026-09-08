import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Abonnement, OperateurPaiement, PaiementAbonnement, PalierAbonnement } from '../models/abonnement.model';

export interface PayerAbonnementPayload {
  palier: PalierAbonnement;
  operateur: OperateurPaiement;
  numeroTelephone: string;
}

@Injectable({ providedIn: 'root' })
export class AbonnementService {
  constructor(private http: HttpClient) {}

  getMyAbonnement(): Observable<Abonnement> {
    return this.http.get<Abonnement>(`${environment.apiUrl}/depots/me/abonnement`);
  }

  payer(payload: PayerAbonnementPayload): Observable<{ abonnement: Abonnement; paiement: PaiementAbonnement }> {
    return this.http.post<{ abonnement: Abonnement; paiement: PaiementAbonnement }>(
      `${environment.apiUrl}/depots/me/abonnement/paiement`,
      payload
    );
  }

  getMesPaiements(): Observable<PaiementAbonnement[]> {
    return this.http.get<PaiementAbonnement[]>(`${environment.apiUrl}/depots/me/abonnement/paiements`);
  }
}
