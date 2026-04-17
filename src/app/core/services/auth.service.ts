import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'admin' | 'medecin' | 'patient' | 'infirmier' | 'laboratoire';

export interface AuthUser {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  mot_de_passe: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  role: UserRole;
}

interface LoginResponse {
  token: string;
  role: UserRole;
  utilisateur: AuthUser;
}

interface RegisterResponse {
  message: string;
  utilisateur: AuthUser;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  timestamp: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'token';
  private readonly userKey = 'user';
  private readonly roleKey = 'role';

  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.readUserFromStorage());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthUser> {
    return this.http.post<ApiResponse<LoginResponse> | LoginResponse>(`${this.api}/login`, payload).pipe(
      map((response) => this.unwrapResponse(response)),
      tap((response) => this.persistSession(response.token, response.role, response.utilisateur)),
      map((response) => response.utilisateur)
    );
  }

  register(payload: RegisterRequest): Observable<AuthUser> {
    return this.http.post<ApiResponse<RegisterResponse> | RegisterResponse>(`${this.api}/register`, payload).pipe(
      map((response) => this.unwrapResponse(response)),
      map((response) => response.utilisateur)
    );
  }

  fetchProfile(): Observable<AuthUser> {
    return this.http.get<ApiResponse<AuthUser> | AuthUser>(`${this.api}/me`).pipe(
      map((response) => this.unwrapResponse(response)),
      tap((user) => {
        this.currentUserSubject.next(user);
        localStorage.setItem(this.userKey, JSON.stringify(user));
        localStorage.setItem(this.roleKey, user.role);
      })
    );
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  getDashboardRoute(role?: string): string {
    const safeRole = (role || this.getRole()) as UserRole;
    const routes: Record<UserRole, string> = {
      admin: '/admin/dashboard',
      medecin: '/medecin/dashboard',
      patient: '/patient/dashboard',
      infirmier: '/infirmier/dashboard',
      laboratoire: '/laboratoire/dashboard'
    };

    return routes[safeRole] || '/login';
  }

  getRole(): string {
    return localStorage.getItem(this.roleKey) || '';
  }

  getToken(): string {
    return localStorage.getItem(this.tokenKey) || '';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string[]): boolean {
    const role = this.getRole();
    return !!role && roles.includes(role);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  forgotPassword(email: string): Observable<{ message: string; resetToken?: string }> {
    return this.http.post<{ message: string; resetToken?: string }>(`${this.api}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.api}/reset-password`, { token, newPassword });
  }

  private persistSession(token: string, role: UserRole, user: AuthUser): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.roleKey, role);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private readUserFromStorage(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private unwrapResponse<T>(response: ApiResponse<T> | T): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data;
    }

    return response;
  }
}