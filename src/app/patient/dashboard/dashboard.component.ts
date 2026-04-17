import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PatientService } from '../../core/services/patient.service';
import { NotificationService } from '../../core/services/notification.service';

interface Stat {
  icon: string;
  label: string;
  value: string;
  route: string;
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
  loading = false;
  error = '';
  patientName = 'Patient';

  stats: Stat[] = [
    { icon: 'event_note', label: 'Consultations', value: '0', route: '/patient/consultations', color: '#38bdf8', bg: 'rgba(56,189,248,.15)' },
    { icon: 'science', label: 'Analyses en attente', value: '0', route: '/patient/analyses', color: '#818cf8', bg: 'rgba(129,140,248,.15)' },
    { icon: 'medication', label: 'Ordonnances', value: '0', route: '/patient/ordonnances', color: '#f59e0b', bg: 'rgba(245,158,11,.15)' },
    { icon: 'folder_shared', label: 'Mon DME', value: 'Actif', route: '/patient/dme', color: '#10b981', bg: 'rgba(16,185,129,.15)' },
  ];

  recentConsultations: any[] = [];
  recentOrdonnances: any[] = [];

  quickActions = [
    { icon: 'event_note', label: 'Mes consultations', route: '/patient/consultations' },
    { icon: 'science', label: 'Mes analyses', route: '/patient/analyses' },
    { icon: 'medication', label: 'Mes ordonnances', route: '/patient/ordonnances' },
    { icon: 'folder_shared', label: 'Mon DME', route: '/patient/dme' },
  ];

  constructor(
    private readonly patientService: PatientService,
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.patientName = user?.prenom || user?.nom || 'Patient';
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = '';

    this.patientService.getDashboardStats().subscribe({
      next: (response) => {
        const { stats, recentConsultations, recentOrdonnances } = response;

        this.stats = [
          { ...this.stats[0], value: String(stats.totalConsultations) },
          { ...this.stats[1], value: String(stats.pendingAnalyses) },
          { ...this.stats[2], value: String(stats.totalOrdonnances) },
          { ...this.stats[3], value: stats.dmeStatus === 'actif' ? 'Actif' : stats.dmeStatus }
        ];

        this.recentConsultations = recentConsultations.map((c: any) => ({
          diagnostic: c.diagnostic || 'N/A',
          medecin: c.medecin ? `Dr. ${c.medecin.prenom} ${c.medecin.nom}` : 'Médecin',
          date: c.date ? new Date(c.date).toLocaleDateString('fr-FR') : 'N/A',
          type: 'Consultation'
        }));

        this.recentOrdonnances = recentOrdonnances.map((o: any) => ({
          medicament: o.medicament || 'N/A',
          medecin: o.medecin ? `Dr. ${o.medecin.prenom} ${o.medecin.nom}` : 'Médecin',
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
