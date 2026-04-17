import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, UserRole } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  role = 'medecin';
  showPwd = false;
  remember = false;
  isLoading = false;
  errorMsg = '';
  private redirectUrl: string | null = null;

  roles = [
    { key: 'medecin', label: 'Médecin', icon: 'stethoscope' },
    { key: 'patient', label: 'Patient', icon: 'person' },
    { key: 'infirmier', label: 'Infirmier', icon: 'monitor_heart' },
    { key: 'laboratoire', label: 'Laboratoire', icon: 'science' },
    { key: 'admin', label: 'Admin', icon: 'admin_panel_settings' }
  ];

  features = [
    { icon: 'security', text: 'Données 100% sécurisées RGPD' },
    { icon: 'speed', text: 'Interface rapide et intuitive' },
    { icon: 'sync', text: 'Synchronisation en temps réel' },
    { icon: 'people', text: 'Collaboration médecin-patient' },
  ];

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService
  ) {
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirectUrl');
  }

  setRole(r: string) {
    this.role = r;
    this.errorMsg = '';
  }

  login() {
    this.errorMsg = '';
    if (!this.email || !this.password) {
      this.errorMsg = 'Veuillez remplir tous les champs.';
      return;
    }
    this.isLoading = true;
    this.authService
      .login({ email: this.email.trim(), mot_de_passe: this.password })
      .subscribe({
        next: (user) => {
          this.isLoading = false;

          const target = this.redirectUrl || this.authService.getDashboardRoute(user.role as UserRole);
          this.router.navigateByUrl(target);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMsg = error?.error?.message || 'Connexion impossible. Verifiez vos identifiants.';
        }
      });
  }
}