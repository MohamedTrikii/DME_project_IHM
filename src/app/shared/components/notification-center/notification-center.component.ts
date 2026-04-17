import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Notification, NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-center',
  template: `
    <div class="notification-container">
      <div
        *ngFor="let notification of notifications; trackBy: trackById"
        [ngClass]="'notification-' + notification.type"
        class="notification-toast"
      >
        <span class="material-icons">{{ getIcon(notification.type) }}</span>
        <span class="message">{{ notification.message }}</span>
        <button class="close-btn" (click)="removeNotification(notification.id)">
          <span class="material-icons">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    }

    .notification-toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--radius-md);
      font-size: 0.9rem;
      font-weight: 500;
      pointer-events: auto;
      box-shadow: var(--shadow-md);
      animation: slideInRight 0.3s ease-out;
    }

    .notification-success {
      background: rgba(16, 185, 129, 0.1);
      border-left: 3px solid var(--success);
      color: var(--success);
    }

    .notification-error {
      background: rgba(239, 68, 68, 0.1);
      border-left: 3px solid var(--danger);
      color: var(--danger);
    }

    .notification-warning {
      background: rgba(245, 158, 11, 0.1);
      border-left: 3px solid var(--warning);
      color: var(--warning);
    }

    .notification-info {
      background: rgba(96, 165, 250, 0.1);
      border-left: 3px solid var(--info);
      color: var(--info);
    }

    .material-icons {
      font-size: 20px;
      flex-shrink: 0;
    }

    .message {
      flex: 1;
    }

    .close-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity var(--t-fast);
    }

    .close-btn:hover {
      opacity: 1;
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @media (max-width: 768px) {
      .notification-container {
        right: 12px;
        left: 12px;
        max-width: none;
      }
    }
  `]
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe((notifications: Notification[]) => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeNotification(id: string): void {
    this.notificationService.remove(id);
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      success: 'check_circle',
      error: 'error',
      warning: 'warning',
      info: 'info'
    };
    return icons[type] || 'info';
  }

  trackById(index: number, notification: Notification): string {
    return notification.id;
  }
}
