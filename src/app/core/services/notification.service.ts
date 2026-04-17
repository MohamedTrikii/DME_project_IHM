import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private notificationIdCounter = 0;

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  success(message: string, duration: number = 4000): void {
    this.notify(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.notify(message, 'error', duration);
  }

  warning(message: string, duration: number = 4000): void {
    this.notify(message, 'warning', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.notify(message, 'info', duration);
  }

  private notify(message: string, type: NotificationType, duration: number): void {
    const id = `notification-${++this.notificationIdCounter}`;
    const notification: Notification = { id, message, type, duration };

    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  remove(id: string): void {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter((n) => n.id !== id));
  }
}
