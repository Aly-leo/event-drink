import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Avis } from '../models/avis.model';

export interface CreateAvisPayload {
  commandeId: string;
  note: number;
  commentaire?: string;
}

@Injectable({ providedIn: 'root' })
export class AvisService {
  constructor(private http: HttpClient) {}

  create(payload: CreateAvisPayload): Observable<Avis> {
    return this.http.post<Avis>(`${environment.apiUrl}/avis`, payload);
  }
}
