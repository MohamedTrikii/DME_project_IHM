import { Component, OnInit } from '@angular/core';
import { AccessLog, AdminService, DashboardStats } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notification.service';

interface Stat {
  icon: string;
  label: string;
  value: string;
  trend: number;
  color: string;
  bg: string;
}

interface User {
  _id?: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

interface Action {
  label: string;
  icon: string;
  route: string;
  color: string;
}

interface Log {
  action: string;
  user: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  today: string = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  isLoading = false;
  errorMsg = '';

  stats: Stat[] = [
    { icon: 'people', label: 'Utilisateurs', value: '0', trend: 0, color: '#38bdf8', bg: 'rgba(56,189,248,.15)' },
    { icon: 'folder_shared', label: 'Patients', value: '0', trend: 0, color: '#10b981', bg: 'rgba(16,185,129,.15)' },
    { icon: 'security', label: 'Alertes sécurité', value: '0', trend: 0, color: '#ef4444', bg: 'rgba(239,68,68,.15)' },
    { icon: 'description', label: 'Logs aujourd\'hui', value: '0', trend: 0, color: '#f59e0b', bg: 'rgba(245,158,11,.15)' },
  ];

  recentUsers: User[] = [];
  recentLogs: Log[] = [];

  quickActions: Action[] = [
    { label: 'Ajouter', icon: 'person_add', route: '/admin/add-user', color: 'var(--primary)' },
    { label: 'Logs', icon: 'description', route: '/admin/logs', color: 'var(--warning)' },
    { label: 'Audit', icon: 'security', route: '/admin/audit-logs', color: 'var(--danger)' },
    { label: 'Archive', icon: 'archive', route: '/admin/archive', color: 'var(--accent-violet)' },
  ];

  constructor(
    private readonly adminService: AdminService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.adminService.getStats().subscribe({
      next: (stats) => {
        this.applyStats(stats);
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Impossible de charger les statistiques.';
        this.notificationService.error(this.errorMsg);
      }
    });

    this.adminService.getUsers().subscribe({
      next: (users) => {
        this.recentUsers = users.slice(0, 5);
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Impossible de charger les utilisateurs.';
        this.notificationService.error(this.errorMsg);
        this.isLoading = false;
      }
    });

    this.adminService.getAccessLogs(5).subscribe({
      next: (logs) => {
        this.recentLogs = this.mapLogs(logs);
      },
      error: (error) => {
        const msg = error?.error?.message || 'Impossible de charger les logs.';
        this.notificationService.warning(msg);
      }
    });
  }

  private applyStats(stats: DashboardStats): void {
    this.stats = [
      { ...this.stats[0], value: String(stats.totalUsers) },
      { ...this.stats[1], value: String(stats.totalPatients) },
      { ...this.stats[2], value: String(stats.securityAlerts) },
      { ...this.stats[3], value: String(stats.logsToday) }
    ];
  }

  private mapLogs(logs: AccessLog[]): Log[] {
    return logs.map((log) => ({
      action: log.action,
      user: `${log.utilisateur?.prenom || ''} ${log.utilisateur?.nom || ''}`.trim() || 'Systeme',
      time: new Date(log.createdAt || log.date || Date.now()).toLocaleString('fr-FR')
    }));
  }

  roleBadge(role: string): string {
    const m: Record<string, string> = {
      medecin: 'badge-primary',
      patient: 'badge-success',
      infirmier: 'badge-info',
      admin: 'badge-warning',
      laboratoire: 'badge-info'
    };
    return m[role] || 'badge-info';
  }

  retry(): void {
    this.loadDashboard();
  }
}

