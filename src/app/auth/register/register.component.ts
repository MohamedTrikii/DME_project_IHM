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
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  readonly roles: UserRole[] = ['patient', 'medecin', 'infirmier', 'laboratoire'];

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  register(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.nom || !this.prenom || !this.email || !this.motDePasse) {
      this.errorMsg = 'Veuillez renseigner tous les champs obligatoires.';
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
          this.successMsg = 'Compte cree avec succes. Vous pouvez vous connecter.';
          setTimeout(() => this.router.navigate(['/login']), 1200);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMsg = error?.error?.message || 'Inscription impossible pour le moment.';
        }
      });
  }

}
