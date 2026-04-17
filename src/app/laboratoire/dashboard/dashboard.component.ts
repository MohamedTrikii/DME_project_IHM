import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { LaboratoireService } from '../../core/services/laboratoire.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Stat {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-laboratoire-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class LaboratoireDashboardComponent implements OnInit {
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  userName = 'Laborantin';
  loading = false;
  error = '';

  stats: Stat[] = [
    { icon: 'pending_actions', label: 'En attente', value: '0', sub: 'Demandes', color: '#f59e0b', bg: 'rgba(245,158,11,.15)' },
    { icon: 'science', label: 'Total demandes', value: '0', sub: 'Total', color: '#38bdf8', bg: 'rgba(56,189,248,.15)' },
    { icon: 'check_circle', label: 'Résultats envoyés', value: '0', sub: 'Mes résultats', color: '#10b981', bg: 'rgba(16,185,129,.15)' },
    { icon: 'task_alt', label: 'Demandes terminées', value: '0', sub: 'Terminées', color: '#818cf8', bg: 'rgba(129,140,248,.15)' },
  ];

  recentDemandes: { type: string; patient: string; statut: string; date: string }[] = [];
  recentResultats: { resultat: string; patient: string; date: string }[] = [];

  actions = [
    { label: 'Demandes en attente', icon: 'pending_actions', route: '/laboratoire/demandes', color: 'var(--warning)' },
    { label: 'Envoyer résultat', icon: 'upload_file', route: '/laboratoire/upload-result', color: 'var(--success)' },
    { label: 'Rendez-vous', icon: 'event', route: '/laboratoire/rendezvous', color: 'var(--primary)' },
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user ? `${user.prenom} ${user.nom}` : 'Laborantin';
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.http.get<any>(`${environment.apiUrl}/laboratoire/stats`).subscribe({
      next: (data) => {
        this.stats[0].value = String(data.demandesEnAttente || 0);
        this.stats[1].value = String(data.totalDemandes || 0);
        this.stats[2].value = String(data.totalResultats || 0);
        this.stats[3].value = String(data.demandesTerminees || 0);

        this.recentDemandes = (data.recentDemandes || []).map((d: any) => ({
          type: d.typeAnalyse || 'Analyse',
          patient: `${d.patient?.prenom || ''} ${d.patient?.nom || ''}`.trim() || 'Patient',
          statut: d.statut || 'en attente',
          date: new Date(d.dateDemande || Date.now()).toLocaleDateString('fr-FR')
        }));

        this.recentResultats = (data.recentResultats || []).map((r: any) => ({
          resultat: r.resultat || 'Résultat',
          patient: `${r.demande?.patient?.prenom || ''} ${r.demande?.patient?.nom || ''}`.trim() || 'Patient',
          date: new Date(r.dateResultat || Date.now()).toLocaleDateString('fr-FR')
        }));

        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement';
        this.loading = false;
        this.notificationService.error(this.error);
      }
    });
  }

  statusBadge(statut: string): string {
    const map: Record<string, string> = {
      'en attente': 'badge-warning',
      'en cours': 'badge-info',
      'termine': 'badge-success'
    };
    return map[statut] || 'badge-info';
  }

  retry(): void {
    this.loadDashboard();
  }
}
