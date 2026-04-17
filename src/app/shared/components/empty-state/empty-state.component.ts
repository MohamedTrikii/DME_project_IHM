import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <span class="material-icons">{{ icon }}</span>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button *ngIf="actionLabel" class="btn btn-primary" (click)="onAction.emit()">
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 48px 24px;
      text-align: center;
      min-height: 300px;
    }

    .empty-icon {
      font-size: 64px;
      color: var(--text-muted);
      opacity: 0.5;
    }

    h3 {
      color: var(--text-primary);
      font-size: 1.2rem;
      margin: 0;
    }

    p {
      color: var(--text-secondary);
      margin: 0;
      max-width: 300px;
    }

    .btn {
      margin-top: 12px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Aucune donnée';
  @Input() message = 'Il n\'y a rien à afficher pour le moment.';
  @Input() actionLabel: string | null = null;

  onAction = {
    emit: () => {}
  };
}
