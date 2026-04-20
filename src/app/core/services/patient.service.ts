import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Patient {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  dateNais?: string;
  adresse?: string;
  telephone?: string;
  dme?: string;
}

export interface PatientDashboardStats {
  totalConsultations: number;
  totalOrdonnances: number;
  pendingAnalyses: number;
  dmeStatus: string;
}

export interface PatientDashboardResponse {
  stats: PatientDashboardStats;
  recentConsultations: any[];
  recentOrdonnances: any[];
}

interface CreatePatientRequest {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  dateNais?: string;
  adresse?: string;
  telephone?: string;
}

interface CreatePatientResponse {
  message: string;
  patient: Patient;
}

interface UpdatePatientResponse {
  message: string;
  patient: Patient;
  data?: Patient;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly api = `${environment.apiUrl}/patient`;
  private readonly medecinApi = `${environment.apiUrl}/medecin`;

  constructor(private readonly http: HttpClient) {}

  // Révocation d'accès DME pour un médecin
  revokeAccess(patientId: string, userId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/dme/patient/${patientId}/revoke/${userId}`);
  }

  // === Dashboard ===
  getDashboardStats(): Observable<PatientDashboardResponse> {
    return this.http.get<any>(`${this.api}/dashboard/stats`).pipe(
      map(response => response.data || response)
    );
  }

  // === My data (for patient role) ===
  getMyConsultations(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.api}/me/consultations`, { params }).pipe(
      map(response => response.data || response)
    );
  }

  getMyOrdonnances(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.api}/me/ordonnances`, { params }).pipe(
      map(response => response.data || response)
    );
  }

  getMyAnalyses(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.api}/me/analyses`, { params }).pipe(
      map(response => response.data || response)
    );
  }

  // === Admin/Medecin access ===
  getAll(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) {
      params = params.set('search', search);
    }

    // Utiliser l'endpoint medecin/patients pour le médecin
    return this.http.get<any>(`${this.medecinApi}/patients`, { params }).pipe(
      map(response => response.data?.patients ?? response.data ?? response)
    );
  }

  getById(id: string): Observable<Patient> {
    return this.http.get<any>(`${this.api}/${id}`).pipe(
      map(response => response.data || response)
    );
  }

  getDmeByPatientId(id: string): Observable<any> {
    return this.http.get<any>(`${this.api}/${id}/dme`).pipe(
      map(response => response.data || response)
    );
  }

  create(data: CreatePatientRequest): Observable<Patient> {
    return this.http
      .post<CreatePatientResponse>(`${this.medecinApi}/patients`, data)
      .pipe(map((response) => response.patient || response));
  }

  update(id: string, data: Partial<Patient>): Observable<Patient> {
    return this.http
      .put<UpdatePatientResponse>(`${this.api}/${id}`, data)
      .pipe(map((response) => response.patient || response.data || response));
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/admin/users/${id}`);
  }

  grantAccess(id: string, medecinId: string): Observable<any> {
    return this.http.put(`${this.api}/${id}/access`, { medecinId });
  }
}