import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategorieProduit, Produit } from '../models/produit.model';

export interface CreateProduitPayload {
  nom: string;
  marque: string;
  contenance: string;
  categorie: CategorieProduit;
  visuelUrl?: string;
  estConsignable: boolean;
}

export type UpdateProduitPayload = Partial<CreateProduitPayload>;

@Injectable({ providedIn: 'root' })
export class CatalogueService {
  constructor(private http: HttpClient) {}

  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${environment.apiUrl}/catalogue/produits`);
  }

  createProduit(payload: CreateProduitPayload): Observable<Produit> {
    return this.http.post<Produit>(`${environment.apiUrl}/catalogue/produits`, payload);
  }

  updateProduit(id: string, payload: UpdateProduitPayload): Observable<Produit> {
    return this.http.patch<Produit>(`${environment.apiUrl}/catalogue/produits/${id}`, payload);
  }
}
