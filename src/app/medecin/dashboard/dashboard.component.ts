import { Component, OnInit } from '@angular/core';
import { MedecinService } from '../../core/services/medecin.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

interface Stat {
  icon: string;
  label: string;
  value: string;
  sub: string;
  color: string;
  bg: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  medecinName = 'Médecin';
  loading = false;
  error = '';

  stats: Stat[] = [
    { icon: 'groups', label: 'Mes patients', value: '0', sub: 'Total', color: '#38bdf8', bg: 'rgba(56,189,248,.15)' },
    { icon: 'event_note', label: 'Consultations aujourd\'hui', value: '0', sub: 'Aujourd\'hui', color: '#10b981', bg: 'rgba(16,185,129,.15)' },
    { icon: 'receipt_long', label: 'Total consultations', value: '0', sub: 'Total', color: '#f59e0b', bg: 'rgba(245,158,11,.15)' },
    { icon: 'biotech', label: 'Analyses en attente', value: '0', sub: 'À valider', color: '#818cf8', bg: 'rgba(129,140,248,.15)' },
  ];

  recentConsultations: any[] = [];
  recentOrdonnances: any[] = [];

  actions = [
    { label: 'Recherche DME', icon: 'search', route: '/medecin/search-dme', color: 'var(--primary)' },
    { label: 'Nouvelle consultation', icon: 'add_circle', route: '/medecin/add-consultation', color: 'var(--success)' },
    { label: 'Ordonnance', icon: 'receipt_long', route: '/medecin/create-ordonnance', color: 'var(--warning)' },
    { label: 'Demande analyse', icon: 'biotech', route: '/medecin/create-analyse-request', color: 'var(--accent-violet)' },
  ];

  constructor(
    private readonly medecinService: MedecinService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.medecinName = user ? `Dr. ${user.prenom} ${user.nom}` : 'Médecin';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    this.medecinService.getDashboardStats().subscribe({
      next: (response) => {
        const { stats, recentConsultations, recentOrdonnances } = response;

        this.stats = [
          { ...this.stats[0], value: String(stats.totalPatients) },
          { ...this.stats[1], value: String(stats.consultationsToday) },
          { ...this.stats[2], value: String(stats.totalConsultations) },
          { ...this.stats[3], value: String(stats.pendingAnalyses) }
        ];

        this.recentConsultations = recentConsultations.map((c: any) => ({
          diagnostic: c.diagnostic || 'N/A',
          patient: c.patient ? `${c.patient.prenom} ${c.patient.nom}` : 'Patient',
          date: c.date ? new Date(c.date).toLocaleDateString('fr-FR') : 'N/A'
        }));

        this.recentOrdonnances = recentOrdonnances.map((o: any) => ({
          medicament: o.medicament || 'N/A',
          patient: o.patient ? `${o.patient.prenom} ${o.patient.nom}` : 'Patient',
          date: o.date ? new Date(o.date).toLocaleDateString('fr-FR') : 'N/A'
        }));

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de charger le dashboard.';
        this.notificationService.error(this.error);
        this.loading = false;
      }
    });
  }

  retry(): void {
    this.loadDashboardData();
  }
}
