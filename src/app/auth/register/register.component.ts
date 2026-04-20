import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, UserRole } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nom = '';
  prenom = '';
  email = '';
  motDePasse = '';
  role: UserRole = 'patient';
  showPwd = false;
  isLoading = false;
  errorMsg = '';
  successMsg = '';
  passwordStrength = '';
  strengthLabel = '';
  strengthColor = '';

  readonly roles: UserRole[] = ['patient', 'medecin', 'infirmier', 'laboratoire'];

  readonly roleOptions = [
    { key: 'patient' as UserRole, label: 'Patient', icon: 'person' },
    { key: 'medecin' as UserRole, label: 'Médecin', icon: 'medical_services' },
    { key: 'infirmier' as UserRole, label: 'Infirmier', icon: 'monitor_heart' },
    { key: 'laboratoire' as UserRole, label: 'Labo', icon: 'science' },
  ];

  readonly features = [
    { icon: 'verified_user', text: 'Compte sécurisé et certifié' },
    { icon: 'speed', text: 'Accès instantané à votre espace' },
    { icon: 'lock', text: 'Données chiffrées et protégées' },
  ];

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  checkPasswordStrength(): void {
    const pwd = this.motDePasse;
    if (!pwd) { this.passwordStrength = ''; return; }

    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) {
      this.passwordStrength = 'weak';
      this.strengthLabel = 'Faible';
      this.strengthColor = 'var(--danger)';
    } else if (score <= 2) {
      this.passwordStrength = 'medium';
      this.strengthLabel = 'Moyen';
      this.strengthColor = 'var(--warning)';
    } else if (score <= 3) {
      this.passwordStrength = 'strong';
      this.strengthLabel = 'Fort';
      this.strengthColor = 'var(--success)';
    } else {
      this.passwordStrength = 'very-strong'; // NOSONAR - CSS class name, not a password
      this.strengthLabel = 'Très fort';
      this.strengthColor = 'var(--success)';
    }
  }

  register(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.nom || !this.prenom || !this.email || !this.motDePasse) {
      this.errorMsg = 'Veuillez renseigner tous les champs obligatoires.';
      return;
    }

    if (this.motDePasse.length < 6) {
      this.errorMsg = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }

    this.isLoading = true;

    this.authService
      .register({
        nom: this.nom.trim(),
        prenom: this.prenom.trim(),
        email: this.email.trim(),
        mot_de_passe: this.motDePasse,
        role: this.role
      })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.successMsg = 'Compte créé avec succès ! Redirection...';
          setTimeout(() => this.router.navigate(['/login']), 1200);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMsg = error?.error?.message || 'Inscription impossible pour le moment.';
        }
      });
  }

}
