import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

interface Breadcrumb {
  label: string;
  url: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  template: `
    <nav class="breadcrumb-nav" aria-label="Fil d'Ariane" *ngIf="breadcrumbs.length > 0">
      <a [routerLink]="homeUrl" class="bc-home" aria-label="Accueil">
        <span class="material-icons-round">home</span>
      </a>
      <ng-container *ngFor="let bc of breadcrumbs; let last = last">
        <span class="material-icons-round bc-separator" aria-hidden="true">chevron_right</span>
        <a *ngIf="!last" [routerLink]="bc.url">{{ bc.label }}</a>
        <span *ngIf="last" class="bc-current" [attr.aria-current]="'page'">{{ bc.label }}</span>
      </ng-container>
    </nav>
  `,
  styles: [`
    :host { display: block; }
    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: .82rem;
      color: var(--text-muted);
      flex-wrap: wrap;
    }
    .bc-home {
      display: flex;
      align-items: center;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 150ms ease;
      padding: 2px;
      border-radius: 4px;
    }
    .bc-home:hover { color: var(--primary); }
    .bc-home .material-icons-round { font-size: 18px; }
    .breadcrumb-nav a {
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 500;
      transition: color 150ms ease;
    }
    .breadcrumb-nav a:hover { color: var(--primary); }
    .bc-separator { font-size: 16px; opacity: .4; }
    .bc-current { color: var(--text-primary); font-weight: 600; }
  `]
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: Breadcrumb[] = [];
  homeUrl = '/';
  private readonly destroy$ = new Subject<void>();

  private readonly routeLabels: Record<string, string> = {
    // Admin
    'admin': 'Administration',
    'dashboard': 'Dashboard',
    'users': 'Utilisateurs',
    'add-user': 'Ajouter utilisateur',
    'edit-user': 'Modifier utilisateur',
    'logs': 'Journaux',
    'audit-logs': 'Audit sécurité',
    'archive': 'Archivage',
    // Patient
    'patient': 'Espace patient',
    'consultations': 'Consultations',
    'analyses': 'Analyses',
    'ordonnances': 'Ordonnances',
    'dme': 'Dossier médical',
    'messages': 'Messages',
    'access-management': 'Gestion des accès',
    'profile': 'Profil',
    // Medecin
    'medecin': 'Espace médecin',
    'patients': 'Patients',
    'add-consultation': 'Nouvelle consultation',
    'add-diagnostic': 'Nouveau diagnostic',
    'create-ordonnance': 'Créer ordonnance',
    'create-analyse-request': 'Demande analyse',
    'create-patient': 'Nouveau patient',
    'edit-patient': 'Modifier patient',
    'search-dme': 'Recherche DME',
    'ordonnance': 'Ordonnances',
    // Infirmier
    'infirmier': 'Espace infirmier',
    'dossier': 'Dossier patient',
    'historique': 'Historique',
    'observations': 'Observations',
    // Laboratoire
    'laboratoire': 'Laboratoire',
    'demandes': 'Demandes',
    'rendezvous': 'Rendez-vous',
    'upload-result': 'Dépôt résultat',
  };

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.buildBreadcrumbs());
    this.buildBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildBreadcrumbs(): void {
    const url = this.router.url.split('?')[0].split('#')[0];
    const segments = url.split('/').filter(s => s);

    if (segments.length === 0) {
      this.breadcrumbs = [];
      return;
    }

    // Set home URL to role dashboard
    this.homeUrl = `/${segments[0]}/dashboard`;

    const crumbs: Breadcrumb[] = [];
    let currentUrl = '';

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentUrl += `/${segment}`;

      // Skip UUID/ID segments but keep them in URL
      if (segment.match(/^[a-f0-9]{24}$/i) || segment.match(/^[a-f0-9-]{36}$/i)) {
        continue;
      }

      const label = this.routeLabels[segment] || this.formatSegment(segment);
      crumbs.push({ label, url: currentUrl });
    }

    this.breadcrumbs = crumbs;
  }

  private formatSegment(segment: string): string {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }
}
