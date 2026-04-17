import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  pageTitle = 'DME Platform';
  currentTime = '';
  userName = 'Utilisateur';
  userInitial = 'U';
  userRole = 'Patient';
  searchOpen = false;
  searchQuery = '';
  showNotif = false;
  hasNotif = true;
  currentTheme: 'light' | 'dark' = 'light';
  private clockInterval: any;
  private clickListener: any;
  private readonly destroy$ = new Subject<void>();

  notifications = [
    { icon: 'event', message: 'Rendez-vous demain à 10h00', time: 'il y a 5 min' },
    { icon: 'science', message: 'Résultats analyses disponibles', time: 'il y a 1h' },
    { icon: 'medication', message: 'Nouvelle ordonnance émise', time: 'il y a 3h' },
  ];

  private readonly routeTitles: Record<string, string> = {
    '/patient/dashboard': 'Dashboard Patient',
    '/patient/consultations': 'Mes Consultations',
    '/patient/analyses': 'Mes Analyses',
    '/patient/ordonnances': 'Mes Ordonnances',
    '/patient/dme': 'Mon Dossier Médical',
    '/patient/messages': 'Messages',
    '/patient/access-management': 'Gestion des Accès',
    '/patient/profile': 'Mon Profil',
    '/medecin/dashboard': 'Dashboard Médecin',
    '/medecin/patients': 'Liste des Patients',
    '/medecin/dme': 'Dossier Médical',
    '/medecin/add-consultation': 'Nouvelle Consultation',
    '/medecin/create-ordonnance': 'Créer Ordonnance',
    '/medecin/create-analyse-request': 'Demande Analyse',
    '/medecin/create-patient': 'Nouveau Patient',
    '/medecin/search-dme': 'Recherche DME',
    '/admin/dashboard': 'Dashboard Admin',
    '/admin/users': 'Utilisateurs',
    '/admin/add-user': 'Ajouter Utilisateur',
    '/admin/logs': 'Journaux Système',
    '/admin/audit-logs': 'Audit Sécurité',
    '/admin/archive': 'Archivage',
    '/infirmier/dashboard': 'Dashboard Infirmier',
    '/infirmier/dossier': 'Dossier Patient',
    '/infirmier/historique': 'Historique',
    '/infirmier/observations': 'Observations',
    '/laboratoire/dashboard': 'Dashboard Laboratoire',
    '/laboratoire/demandes': 'Demandes Analyse',
    '/laboratoire/rendezvous': 'Rendezvous',
    '/laboratoire/upload-result': 'Depot Resultat',
  };

  constructor(
    private readonly router: Router,
    private readonly renderer: Renderer2,
    private readonly authService: AuthService,
    private readonly themeService: ThemeService,
    private readonly sidebarService: SidebarService
  ) { }

  ngOnInit() {
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.updateTitle();
      this.detectUser();
    });
    this.updateTitle();
    this.detectUser();
    this.clickListener = this.renderer.listen('document', 'click', () => {
      if (this.showNotif) this.showNotif = false;
    });

    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  updateTitle() {
    const url = this.router.url.split('?')[0];
    this.pageTitle = this.routeTitles[url] || 'DME Platform';
  }

  detectUser() {
    const user = this.authService.getCurrentUser();
    const role = this.authService.getRole();

    if (user) {
      this.userName = `${user.prenom} ${user.nom}`.trim();
      this.userInitial = `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase() || 'U';
    }

    const labels: Record<string, string> = {
      medecin: 'Medecin',
      patient: 'Patient',
      admin: 'Admin',
      infirmier: 'Infirmier',
      laboratoire: 'Laboratoire'
    };
    this.userRole = labels[role] || 'Utilisateur';
  }

  openSearch() { this.searchOpen = true; }
  closeSearch() { if (!this.searchQuery) this.searchOpen = false; }
  toggleMenu() { this.sidebarService.emit(); }
  clearNotifs() { this.notifications = []; this.hasNotif = false; this.showNotif = false; }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  ngOnDestroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.clickListener) this.clickListener();
    this.destroy$.next();
    this.destroy$.complete();
  }
}