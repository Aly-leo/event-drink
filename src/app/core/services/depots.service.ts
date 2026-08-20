import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Depot, DepotDetail } from '../models/depot.model';

export interface DepotsSearchParams {
  lat?: number;
  lng?: number;
  rayonKm?: number;
  tri?: 'distance';
}

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
}
