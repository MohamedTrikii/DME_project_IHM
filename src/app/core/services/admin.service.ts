import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  archived?: boolean;
  telephone?: string;
  specialite?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalPatients: number;
  totalMedecins: number;
  totalInfirmiers: number;
  totalLaboratoires: number;
  totalConsultations: number;
  totalAnalyses: number;
  totalRapports: number;
  logsToday: number;
  securityAlerts: number;
}

export interface AccessLog {
  _id: string;
  utilisateur?: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    role: string;
  };
  action: string;
  date?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserMutationResponse {
  message: string;
  user: User;
}

interface DeleteResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  constructor(private readonly http: HttpClient) { }

  // User Management
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getAllUsers(): Observable<User[]> {
    return this.getUsers();
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${id}`);
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http
      .post<UserMutationResponse>(`${this.apiUrl}/users/create`, user)
      .pipe(map((response) => response.user));
  }

  updateUser(id: string, user: Partial<User>): Observable<User> {
    return this.http
      .put<UserMutationResponse>(`${this.apiUrl}/users/${id}`, user)
      .pipe(map((response) => response.user));
  }

  archiveUser(id: string): Observable<User> {
    return this.http
      .put<UserMutationResponse>(`${this.apiUrl}/users/${id}/archive`, {})
      .pipe(map((response) => response.user));
  }

  deleteUser(id: string): Observable<DeleteResponse> {
    return this.http.delete<DeleteResponse>(`${this.apiUrl}/users/${id}`);
  }

  // Dashboard Statistics
  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.getStats();
  }

  // Access Logs
  getAccessLogs(limit: number = 50): Observable<AccessLog[]> {
    return this.http.get<AccessLog[]>(`${this.apiUrl}/logs?limit=${limit}`);
  }

  // Archive Management
  getArchivedData(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map((users) => users.filter((user: any) => user?.statut === 'archive' || user?.statut === 'archivé'))
    );
  }

  exportData(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' });
  }

  // Recherche utilisateur pour autocomplétion accès DME
  searchUsers(q: string, role: string = ''): Observable<User[]> {
    const params: any = { q };
    if (role) params.role = role;
    return this.http.get<User[]>(`${this.apiUrl}/search-users`, { params });
  }
}