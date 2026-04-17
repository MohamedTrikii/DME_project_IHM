import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DME {
  _id: string;
  dmeId?: string;
  patient: any;
  dateCreation: Date;
  statut: string;
  accesAutorise: any[];
  observations: any[];
  ordonnances: any[];
  consultations: any[];
  demandes: any[];
  resultats: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DmeService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // === DME ===
  getAllDme(): Observable<DME[]> {
    return this.http.get<any>(`${this.apiUrl}/dme`).pipe(map(r => r.data));
  }

  getDmeById(id: string): Observable<DME> {
    return this.http.get<any>(`${this.apiUrl}/dme/${id}`).pipe(map(r => r.data));
  }

  getDmeByPatient(patientId: string): Observable<DME> {
    return this.http.get<any>(`${this.apiUrl}/dme/patient/${patientId}`).pipe(map(r => r.data));
  }

  createDme(patientId: string): Observable<DME> {
    return this.http.post<any>(`${this.apiUrl}/dme`, { patientId }).pipe(map(r => r.data));
  }

  updateDme(id: string, data: Partial<DME>): Observable<DME> {
    return this.http.put<any>(`${this.apiUrl}/dme/${id}`, data).pipe(map(r => r.data));
  }

  grantAccess(dmeId: string, medecinId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/dme/${dmeId}/access`, { medecinId }).pipe(map(r => r.data));
  }

  revokeAccess(dmeId: string, medecinId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/dme/${dmeId}/access/${medecinId}`).pipe(map(r => r.data));
  }

  // === Consultations ===
  addConsultation(data: {
    patientId: string;
    dmeId: string;
    diagnostic: string;
    traitement?: string;
    notes?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/consultation`, data);
  }

  getConsultations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/consultation`);
  }

  getConsultationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/consultation/${id}`);
  }

  // === Ordonnances ===
  addOrdonnance(data: {
    patientId: string;
    dmeId: string;
    medicament: string;
    posologie?: string;
    duree?: string;
    dateLimite?: Date;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/ordonnance`, data);
  }

  getOrdonnances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ordonnance`);
  }

  getOrdonnanceById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/ordonnance/${id}`);
  }

  // === Demandes d'analyse ===
  addDemandeAnalyse(data: {
    patientId: string;
    dmeId: string;
    typeAnalyse: string;
    description?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/analyse`, data);
  }

  getDemandesAnalyse(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analyse`);
  }

  // === Résultats ===
  getResultats(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/resultat`);
  }

  getResultatById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/resultat/${id}`);
  }
}