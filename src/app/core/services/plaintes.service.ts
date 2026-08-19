import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ActionAdminPlainte, Plainte, StatutPlainte } from '../models/plainte.model';

export interface PlaintesFilters {
  statut?: StatutPlainte;
  depotId?: string;
}

@Injectable({ providedIn: 'root' })
export class PlaintesService {
  constructor(private http: HttpClient) {}

  getPlaintes(filters: PlaintesFilters = {}): Observable<Plainte[]> {
    const params = new HttpParams({
      fromObject: Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined)) as Record<
        string,
        string
      >,
    });
    return this.http.get<Plainte[]>(`${environment.apiUrl}/plaintes`, { params });
  }

  resoudre(id: string): Observable<Plainte> {
    return this.http.patch<Plainte>(`${environment.apiUrl}/plaintes/${id}/resoudre`, {});
  }

  appliquerAction(id: string, action: ActionAdminPlainte): Observable<Plainte> {
    return this.http.patch<Plainte>(`${environment.apiUrl}/plaintes/${id}/action`, { action });
  }
}
