import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DmeRef {
  _id?: string;
  patient?: string | { _id?: string; nom?: string; prenom?: string; email?: string };
}

export interface ConsultationItem {
  _id?: string;
  date?: string;
  diagnostic?: string;
  traitement?: string;
  dme?: string | DmeRef;
}

export interface DemandeAnalyseItem {
  _id?: string;
  typeAnalyse?: string;
  statut?: string;
  dateDemande?: string;
  dme?: string | DmeRef;
}

export interface OrdonnanceItem {
  _id?: string;
  date?: string;
  medicament?: string;
  posologie?: string;
  duree?: string;
  dateLimite?: string;
  dme?: string | DmeRef;
}

export interface ResultatItem {
  _id?: string;
  dateResultat?: string;
  resultat?: string;
  demande?: string | { _id?: string; dme?: string | DmeRef };
}

@Injectable({ providedIn: 'root' })
export class MedicalDataService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private readonly http: HttpClient) {}

  getConsultations(): Observable<ConsultationItem[]> {
    return this.http.get<ConsultationItem[]>(`${this.apiUrl}/consultation`);
  }

  getDemandesAnalyses(): Observable<DemandeAnalyseItem[]> {
    return this.http.get<DemandeAnalyseItem[]>(`${this.apiUrl}/analyse`);
  }

  getOrdonnances(): Observable<OrdonnanceItem[]> {
    return this.http.get<OrdonnanceItem[]>(`${this.apiUrl}/ordonnance`);
  }

  getResultats(): Observable<ResultatItem[]> {
    return this.http.get<ResultatItem[]>(`${this.apiUrl}/resultat`);
  }

  getAllDmes(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/dme`).pipe(map(r => r.data));
  }

  getDmeByPatientId(patientId: string): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/patient/${patientId}/dme`).pipe(map(r => r.data));
}

  getInfirmierDmeById(dmeId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/infirmier/dme/${dmeId}`);
  }

  addInfirmierObservation(dmeId: string, contenu: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/infirmier/observations`, { dmeId, contenu });
  }

  createResultat(payload: { demande: string; resultat: string; interpretation?: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/laboratoire/resultats`, {
      demandeId: payload.demande,
      resultat: payload.resultat,
      interpretation: payload.interpretation
    });
  }

  updateDemandeStatut(id: string, statut: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/laboratoire/demandes/${id}/status`, { statut });
  }
}
