import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Commande, ModeReception } from '../models/commande.model';

export interface CreateCommandePayload {
  depotId: string;
  mode: ModeReception;
  adresseLivraison?: string;
  instructions?: string;
  lignes: { produitDepotId: string; quantite: number }[];
}

@Injectable({ providedIn: 'root' })
export class CommandesService {
  constructor(private http: HttpClient) {}

  create(payload: CreateCommandePayload): Observable<Commande> {
    return this.http.post<Commande>(`${environment.apiUrl}/commandes`, payload);
  }

  getMine(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${environment.apiUrl}/commandes/mine`);
  }

  getOne(id: string): Observable<Commande> {
    return this.http.get<Commande>(`${environment.apiUrl}/commandes/${id}`);
  }
}
