import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
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
  selector: 'app-infirmier-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class InfirmierDashboardComponent implements OnInit {
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  userName = 'Infirmier';
  loading = false;
  error = '';

  stats: Stat[] = [
    { icon: 'groups', label: 'Patients', value: '0', sub: 'Total', color: '#38bdf8', bg: 'rgba(56,189,248,.15)' },
    { icon: 'folder_shared', label: 'Dossiers DME', value: '0', sub: 'Total', color: '#10b981', bg: 'rgba(16,185,129,.15)' },
    { icon: 'assignment', label: 'Mes observations', value: '0', sub: 'Total', color: '#f59e0b', bg: 'rgba(245,158,11,.15)' },
    { icon: 'today', label: 'Observations aujourd\'hui', value: '0', sub: 'Aujourd\'hui', color: '#818cf8', bg: 'rgba(129,140,248,.15)' },
  ];

  recentObservations: { contenu: string; date: string }[] = [];
  recentDmes: { patient: string; id: string }[] = [];

  actions = [
    { label: 'Consulter dossier', icon: 'folder_open', route: '/infirmier/dossier', color: 'var(--primary)' },
    { label: 'Ajouter observation', icon: 'assignment', route: '/infirmier/observations', color: 'var(--success)' },
    { label: 'Historique', icon: 'history', route: '/infirmier/historique', color: 'var(--warning)' },
  ];

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user ? `${user.prenom} ${user.nom}` : 'Infirmier';
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = '';

    this.http.get<any>(`${environment.apiUrl}/infirmier/stats`).subscribe({
      next: (data) => {
        this.stats[0].value = String(data.totalPatients || 0);
        this.stats[1].value = String(data.totalDmes || 0);
        this.stats[2].value = String(data.totalObservations || 0);
        this.stats[3].value = String(data.observationsToday || 0);

        this.recentObservations = (data.recentObservations || []).map((o: any) => ({
          contenu: o.contenu || 'Observation',
          date: new Date(o.date || Date.now()).toLocaleDateString('fr-FR')
        }));

        this.recentDmes = (data.recentDmes || []).map((d: any) => ({
          patient: `${d.patient?.prenom || ''} ${d.patient?.nom || ''}`.trim() || 'Patient',
          id: d._id
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

  retry(): void {
    this.loadDashboard();
  }
}
