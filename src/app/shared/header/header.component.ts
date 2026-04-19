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
  currentDate = '';
  userName = 'Utilisateur';
  userInitial = 'U';
  userRole = 'Patient';
  currentTheme: 'light' | 'dark' = 'light';
  showCalendar = false;
  calendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean; dayNumber: number }[] = [];
  selectedMonth = new Date();
  monthYear = '';
  private clockInterval: any;
  private clickListener: any;
  private readonly destroy$ = new Subject<void>();

  private readonly routeTitles: Record<string, string> = {
    '/patient/dashboard': 'Tableau de bord Patient',
    '/patient/consultations': 'Mes Consultations',
    '/patient/analyses': 'Mes Analyses',
    '/patient/ordonnances': 'Mes Ordonnances',
    '/patient/dme': 'Mon Dossier Médical',
    '/patient/messages': 'Messagerie',
    '/patient/access-management': 'Gestion des Accès',
    '/patient/profile': 'Mon Profil',
    '/medecin/dashboard': 'Tableau de bord Médecin',
    '/medecin/patients': 'Liste des Patients',
    '/medecin/dme': 'Dossier Médical (Patient)',
    '/medecin/add-consultation': 'Nouvelle Consultation',
    '/medecin/create-ordonnance': 'Créer une Ordonnance',
    '/medecin/create-analyse-request': 'Demande d\'Analyse',
    '/medecin/create-patient': 'Enregistrer Nouveau Patient',
    '/medecin/search-dme': 'Recherche DME',
    '/medecin/messages': 'Messagerie',
    '/admin/dashboard': 'Tableau de bord Admin',
    '/admin/users': 'Gestion Utilisateurs',
    '/admin/add-user': 'Ajouter Utilisateur',
    '/admin/logs': 'Journaux Système',
    '/admin/audit-logs': 'Audit de Sécurité',
    '/admin/archive': 'Archives Système',
    '/admin/messages': 'Messagerie',
    '/infirmier/dashboard': 'Tableau de bord Infirmier',
    '/infirmier/dossier': 'Dossier Patient',
    '/infirmier/historique': 'Historique d\'Interventions',
    '/infirmier/observations': 'Nouvelle Observation',
    '/infirmier/messages': 'Messagerie',
    '/laboratoire/dashboard': 'Tableau de bord Laboratoire',
    '/laboratoire/demandes': 'Demandes d\'Analyses',
    '/laboratoire/rendezvous': 'Prises de Sang / RDV',
    '/laboratoire/upload-result': 'Dépôt de Résultats',
    '/laboratoire/messages': 'Messagerie'
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
    this.generateCalendar();
    
    // Close calendar when clicking outside
    this.clickListener = this.renderer.listen('document', 'click', () => {
      if (this.showCalendar) this.showCalendar = false;
    });

    // Subscribe to theme changes
    this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  updateClock() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.currentDate = now.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  updateTitle() {
    const url = this.router.url.split('?')[0];
    this.pageTitle = this.routeTitles[url] || 'DME Platform';
  }

  detectUser() {
    const user = this.authService.getCurrentUser();
    const role = this.authService.getRole();

    if (user) {
      this.userName = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';
      this.userInitial = `${user.prenom?.charAt(0) || ''}${user.nom?.charAt(0) || ''}`.toUpperCase() || 'U';
    }

    const labels: Record<string, string> = {
      medecin: 'Médecin',
      patient: 'Patient',
      admin: 'Administrateur',
      infirmier: 'Infirmier(ère)',
      laboratoire: 'Laboratoire'
    };
    this.userRole = labels[role] || 'Utilisateur';
  }

  toggleCalendar(event: Event) {
    event.stopPropagation();
    this.showCalendar = !this.showCalendar;
    if (this.showCalendar) {
      this.selectedMonth = new Date();
      this.generateCalendar();
    }
  }

  generateCalendar() {
    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth();
    this.monthYear = this.selectedMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const lastDate = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    this.calendarDays = [];
    const today = new Date();
    
    // Previous month days
    for (let i = firstDayWeek; i > 0; i--) {
      const date = new Date(year, month - 1, prevLastDate - i + 1);
      this.calendarDays.push({ 
        date, 
        isCurrentMonth: false, 
        isToday: false,
        dayNumber: prevLastDate - i + 1
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDate; i++) {
      const date = new Date(year, month, i);
      const isToday = date.toDateString() === today.toDateString();
      this.calendarDays.push({ 
        date, 
        isCurrentMonth: true, 
        isToday,
        dayNumber: i
      });
    }
    
    // Next month days
    const remainingDays = 42 - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push({ 
        date, 
        isCurrentMonth: false, 
        isToday: false,
        dayNumber: i
      });
    }
  }

  previousMonth() {
    this.selectedMonth = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.selectedMonth = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1);
    this.generateCalendar();
  }

  toggleMenu() { this.sidebarService.emit(); }

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