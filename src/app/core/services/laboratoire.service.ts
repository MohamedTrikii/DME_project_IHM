import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DemandeAnalyse {
  _id: string;
  typeAnalyse: string;
  description?: string;
  statut: string;
  dateDemande: Date;
  medecin: any;
  patient: any;
  laboratoire?: any;
  dme: any;
}

export interface ResultatAnalyse {
  _id: string;
  dateResultat: Date;
  resultat: string;
  interpretation?: string;
  demande: DemandeAnalyse;
  laboratoire: any;
}

@Injectable({
  providedIn: 'root'
})
export class LaboratoireService {
  private readonly api = `${environment.apiUrl}/laboratoire`;
  private readonly analyseApi = `${environment.apiUrl}/analyse`;
  private readonly resultatApi = `${environment.apiUrl}/resultat`;

  constructor(private readonly http: HttpClient) {}

  // === Demandes ===
  getDemandesEnAttente(): Observable<DemandeAnalyse[]> {
    return this.http.get<DemandeAnalyse[]>(`${this.api}/demandes`);
  }

  getToutesDemandes(): Observable<DemandeAnalyse[]> {
    return this.http.get<DemandeAnalyse[]>(`${this.api}/demandes/all`);
  }

  updateStatutDemande(id: string, statut: string): Observable<DemandeAnalyse> {
    return this.http.put<DemandeAnalyse>(`${this.api}/demandes/${id}/status`, { statut });
  }

  // === Résultats ===
  getResultats(): Observable<ResultatAnalyse[]> {
    return this.http.get<ResultatAnalyse[]>(`${this.api}/resultats`);
  }

  getAllResultats(): Observable<ResultatAnalyse[]> {
    return this.http.get<ResultatAnalyse[]>(this.resultatApi);
  }

  getResultatById(id: string): Observable<ResultatAnalyse> {
    return this.http.get<ResultatAnalyse>(`${this.resultatApi}/${id}`);
  }

  ajouterResultat(data: {
    demandeId: string;
    resultat: string;
    interpretation?: string;
  }): Observable<ResultatAnalyse> {
    return this.http.post<ResultatAnalyse>(`${this.api}/resultats`, data);
  }

  // Alias pour compatibilité
  createResultat(data: {
    demandeId: string;
    resultat: string;
    interpretation?: string;
  }): Observable<ResultatAnalyse> {
    return this.ajouterResultat(data);
  }
}
