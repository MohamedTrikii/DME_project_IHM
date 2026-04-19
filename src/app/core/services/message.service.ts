import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private readonly apiUrl = '/api/messages';

  constructor(private readonly http: HttpClient) {}

  getContacts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/contacts`);
  }

  getConversation(otherUserId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${otherUserId}`);
  }

  sendMessage(destinataireId: string, contenu: string): Observable<any> {
    // Le backend attend { to, text }
    return this.http.post<any>(`${this.apiUrl}/`, { to: destinataireId, text: contenu });
  }
}
