import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { SidebarService } from '../../core/services/sidebar.service';

interface NavItem { icon: string; label: string; route: string; badge?: string; }
interface NavGroup { label: string; items: NavItem[]; }

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  collapsed = false;
  private readonly destroy$ = new Subject<void>();
  userName = 'Utilisateur';
  userInitial = 'U';
  userRole = 'Role';
  navGroups: NavGroup[] = [];

  private readonly patientNav: NavGroup[] = [
    { label: 'Navigation', items: [
      { icon: 'dashboard',         label: 'Dashboard',      route: '/patient/dashboard' },
      { icon: 'event_note',        label: 'Consultations',  route: '/patient/consultations' },
      { icon: 'science',           label: 'Analyses',       route: '/patient/analyses' },
      { icon: 'medication',        label: 'Ordonnances',    route: '/patient/ordonnances' },
      { icon: 'folder_shared',     label: 'Mon DME',        route: '/patient/dme' },
    ]},
    { label: 'Compte', items: [
      { icon: 'forum',             label: 'Messagerie',     route: '/patient/messages' },
      { icon: 'admin_panel_settings', label: 'Acces',       route: '/patient/access-management' },
      { icon: 'manage_accounts',   label: 'Profil',         route: '/patient/profile' },
    ]}
  ];

  private readonly medecinNav: NavGroup[] = [
    { label: 'Navigation', items: [
      { icon: 'dashboard',         label: 'Dashboard',      route: '/medecin/dashboard' },
      { icon: 'groups',            label: 'Patients',       route: '/medecin/patients' },
      { icon: 'search',            label: 'Recherche DME',  route: '/medecin/search-dme' },
      // { icon: 'folder_open',    label: 'DME',            route: '/medecin/dme' }, // supprimé
    ]},
    { label: 'Actions', items: [
      { icon: 'add_circle',        label: 'Consultation',   route: '/medecin/add-consultation' },
      { icon: 'receipt_long',      label: 'Ordonnance',     route: '/medecin/create-ordonnance' },
      { icon: 'biotech',           label: 'Analyse',        route: '/medecin/create-analyse-request' },
      { icon: 'person_add',        label: 'Creer patient',  route: '/medecin/create-patient' },
      { icon: 'forum',             label: 'Messagerie',     route: '/medecin/messages' },
    ]}
  ];

  private readonly adminNav: NavGroup[] = [
    { label: 'Administration', items: [
      { icon: 'dashboard',         label: 'Dashboard',      route: '/admin/dashboard' },
      { icon: 'manage_accounts',   label: 'Utilisateurs',   route: '/admin/users' },
      { icon: 'person_add',        label: 'Ajouter user',   route: '/admin/add-user' }
    ]},
    { label: 'Systeme', items: [
      { icon: 'list_alt',          label: 'Journaux',       route: '/admin/logs' },
      { icon: 'security',          label: 'Audit',          route: '/admin/audit-logs' },
      { icon: 'archive',           label: 'Archivage',      route: '/admin/archive' }
    ]}
  ];

  private readonly infirmierNav: NavGroup[] = [
    { label: 'Navigation', items: [
      { icon: 'dashboard',         label: 'Dashboard',      route: '/infirmier/dashboard' },
      { icon: 'folder_open',       label: 'Dossier',        route: '/infirmier/dossier' },
      { icon: 'history',           label: 'Historique',      route: '/infirmier/historique' },
      { icon: 'assignment',        label: 'Observations',   route: '/infirmier/observations' }
    ]}
  ];

  private readonly laboratoireNav: NavGroup[] = [
    { label: 'Navigation', items: [
      { icon: 'dashboard',         label: 'Dashboard',      route: '/laboratoire/dashboard' },
      { icon: 'science',           label: 'Demandes',       route: '/laboratoire/demandes' },
      { icon: 'event',             label: 'Rendez-vous',    route: '/laboratoire/rendezvous' },
      { icon: 'upload_file',       label: 'Resultats',      route: '/laboratoire/upload-result' }
    ]}
  ];

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly sidebarService: SidebarService
  ) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.detectRole();
      if (window.innerWidth <= 768) this.collapsed = true;
    });
    this.sidebarService.toggle.pipe(takeUntil(this.destroy$)).subscribe(() => this.toggle());
    if (window.innerWidth <= 768) this.collapsed = true;
    this.detectRole();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  detectRole() {
    const role = this.authService.getRole();
    const user = this.authService.getCurrentUser();
    const fullName = user ? `${user.prenom} ${user.nom}`.trim() : '';

    if (fullName) {
      this.userName = fullName;
      this.userInitial = `${user?.prenom?.charAt(0) || ''}${user?.nom?.charAt(0) || ''}`.toUpperCase() || 'U';
    }

    switch (role) {
      case 'medecin':
        this.navGroups = this.medecinNav;
        this.userRole = 'Medecin';
        break;
      case 'admin':
        this.navGroups = this.adminNav;
        this.userRole = 'Administrateur';
        break;
      case 'infirmier':
        this.navGroups = this.infirmierNav;
        this.userRole = 'Infirmier';
        break;
      case 'laboratoire':
        this.navGroups = this.laboratoireNav;
        this.userRole = 'Laboratoire';
        break;
      default:
        this.navGroups = this.patientNav;
        this.userRole = 'Patient';
        break;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggle() { this.collapsed = !this.collapsed; }
}
