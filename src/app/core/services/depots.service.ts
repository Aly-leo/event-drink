import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Depot, DepotDetail } from '../models/depot.model';
import { ProduitDepot } from '../models/produit.model';

export interface DepotsSearchParams {
  lat?: number;
  lng?: number;
  rayonKm?: number;
  tri?: 'distance';
}

export interface CreateMyDepotPayload {
  nomCommerce: string;
  telephone: string;
  adresse: string;
  latitude: number;
  longitude: number;
  modeLivraison?: boolean;
  modeRetrait?: boolean;
  fraisLivraison?: number;
}

export type UpdateMyDepotPayload = Partial<CreateMyDepotPayload> & { visuelUrl?: string };

export interface AddProduitDepotPayload {
  produitId: string;
  prix: number;
  montantConsigne?: number;
  disponible?: boolean;
}

export type UpdateProduitDepotPayload = Partial<Omit<AddProduitDepotPayload, 'produitId'>>;

@Injectable({ providedIn: 'root' })
export class DepotsService {
  constructor(private http: HttpClient) {}

  getDepots(search: DepotsSearchParams = {}): Observable<Depot[]> {
    const raw: Record<string, string> = {};
    if (search.lat !== undefined) raw['lat'] = String(search.lat);
    if (search.lng !== undefined) raw['lng'] = String(search.lng);
    if (search.rayonKm !== undefined) raw['rayonKm'] = String(search.rayonKm);
    if (search.tri) raw['tri'] = search.tri;

    return this.http.get<Depot[]>(`${environment.apiUrl}/depots`, { params: new HttpParams({ fromObject: raw }) });
  }

  getDepot(id: string): Observable<DepotDetail> {
    return this.http.get<DepotDetail>(`${environment.apiUrl}/depots/${id}`);
  }

  getMyDepot(): Observable<Depot | null> {
    return this.http.get<Depot | null>(`${environment.apiUrl}/depots/me`);
  }

  createMyDepot(payload: CreateMyDepotPayload): Observable<Depot> {
    return this.http.post<Depot>(`${environment.apiUrl}/depots/me`, payload);
  }

  updateMyDepot(payload: UpdateMyDepotPayload): Observable<Depot> {
    return this.http.patch<Depot>(`${environment.apiUrl}/depots/me`, payload);
  }

  getMyProduits(): Observable<ProduitDepot[]> {
    return this.http.get<ProduitDepot[]>(`${environment.apiUrl}/depots/me/produits`);
  }

  addMyProduit(payload: AddProduitDepotPayload): Observable<ProduitDepot> {
    return this.http.post<ProduitDepot>(`${environment.apiUrl}/depots/me/produits`, payload);
  }

  updateMyProduit(produitDepotId: string, payload: UpdateProduitDepotPayload): Observable<ProduitDepot> {
    return this.http.patch<ProduitDepot>(`${environment.apiUrl}/depots/me/produits/${produitDepotId}`, payload);
  }
}
