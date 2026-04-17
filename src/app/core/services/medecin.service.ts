import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  totalPatients: number;
  consultationsToday: number;
  totalConsultations: number;
  pendingAnalyses: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recentConsultations: Consultation[];
  recentOrdonnances: Ordonnance[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Consultation {
  _id: string;
  date: Date;
  diagnostic: string;
  traitement?: string;
  notes?: string;
  medecin: any;
  patient: any;
  dme: any;
}

export interface Ordonnance {
  _id: string;
  date: Date;
  medicament: string;
  posologie?: string;
  duree?: string;
  dateLimite?: Date;
  medecin: any;
  patient: any;
  dme: any;
}

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

export interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  dateNais?: Date;
  telephone?: string;
  adresse?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MedecinService {
  private readonly api = `${environment.apiUrl}/medecin`;
  private readonly consultationApi = `${environment.apiUrl}/consultation`;
  private readonly ordonnanceApi = `${environment.apiUrl}/ordonnance`;
  private readonly analyseApi = `${environment.apiUrl}/analyse`;

  constructor(private readonly http: HttpClient) {}

  // === Dashboard ===
  getDashboardStats(): Observable<DashboardResponse> {
    return this.http.get<any>(`${this.api}/dashboard/stats`).pipe(
      map(response => response.data || response)
    );
  }

  // === Patients ===
  getPatients(page: number = 1, limit: number = 10, search: string = ''): Observable<{patients: Patient[], pagination: any}> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(`${this.api}/patients`, { params }).pipe(
      map(response => response.data || response)
    );
  }

  createPatient(data: any): Observable<any> {
    return this.http.post(`${this.api}/patients`, data);
  }

  getPatientById(id: string): Observable<Patient> {
    return this.http.get<any>(`${this.api}/patients/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  updatePatient(id: string, data: Partial<Patient>): Observable<Patient> {
    return this.http.put<any>(`${this.api}/patients/${id}`, data).pipe(
      map(response => response.data || response)
    );
  }

  getPatientDme(patientId: string): Observable<any> {
    return this.http.get(`${this.api}/patients/${patientId}/dme`);
  }

  // === Consultations ===
  getConsultations(): Observable<Consultation[]> {
    return this.http.get<Consultation[]>(this.consultationApi);
  }

  getConsultationById(id: string): Observable<Consultation> {
    return this.http.get<Consultation>(`${this.consultationApi}/${id}`);
  }

  createConsultation(data: {
    patientId: string;
    dmeId: string;
    diagnostic: string;
    traitement?: string;
    notes?: string;
  }): Observable<Consultation> {
    return this.http.post<Consultation>(this.consultationApi, data);
  }

  updateConsultation(id: string, data: Partial<Consultation>): Observable<Consultation> {
    return this.http.put<Consultation>(`${this.consultationApi}/${id}`, data);
  }

  // === Ordonnances ===
  getOrdonnances(): Observable<Ordonnance[]> {
    return this.http.get<Ordonnance[]>(this.ordonnanceApi);
  }

  getOrdonnanceById(id: string): Observable<Ordonnance> {
    return this.http.get<Ordonnance>(`${this.ordonnanceApi}/${id}`);
  }

  createOrdonnance(data: {
    patientId: string;
    dmeId: string;
    medicament: string;
    posologie?: string;
    duree?: string;
    dateLimite?: Date;
  }): Observable<Ordonnance> {
    return this.http.post<Ordonnance>(this.ordonnanceApi, data);
  }

  deleteOrdonnance(id: string): Observable<any> {
    return this.http.delete(`${this.ordonnanceApi}/${id}`);
  }

  // === Demandes d'analyse ===
  getDemandesAnalyse(): Observable<DemandeAnalyse[]> {
    return this.http.get<DemandeAnalyse[]>(this.analyseApi);
  }

  getDemandeAnalyseById(id: string): Observable<DemandeAnalyse> {
    return this.http.get<DemandeAnalyse>(`${this.analyseApi}/${id}`);
  }

  createDemandeAnalyse(data: {
    patientId: string;
    dmeId: string;
    typeAnalyse: string;
    description?: string;
  }): Observable<DemandeAnalyse> {
    return this.http.post<DemandeAnalyse>(this.analyseApi, data);
  }

  // === DME ===
  getDmeByPatient(patientId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/dme/patient/${patientId}`);
  }

  getAllDme(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/dme`);
  }

  getDmeById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/dme/${id}`);
  }
}
