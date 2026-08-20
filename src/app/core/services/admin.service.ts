import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Depot, StatutDepot } from '../models/depot.model';

export interface AdminStats {
  depotsActifs: number;
  depotsEnAttente: number;
  chiffreAffairesTotal: number;
  consignesActives: number;
  plaintesEnAttente: number;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${environment.apiUrl}/admin/stats`);
  }

  getDepots(statut?: StatutDepot): Observable<Depot[]> {
    const params = new HttpParams({ fromObject: statut ? { statut } : {} });
    return this.http.get<Depot[]>(`${environment.apiUrl}/admin/depots`, { params });
  }

  validerDepot(id: string): Observable<Depot> {
    return this.http.patch<Depot>(`${environment.apiUrl}/admin/depots/${id}/valider`, {});
  }

  bloquerDepot(id: string): Observable<Depot> {
    return this.http.patch<Depot>(`${environment.apiUrl}/admin/depots/${id}/bloquer`, {});
  }
}
