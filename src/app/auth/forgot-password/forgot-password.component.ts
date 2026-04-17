import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email = '';
  message = '';
  error = '';
  loading = false;
  emailSent = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  submit(): void {
    if (!this.email.trim()) {
      this.error = 'Veuillez entrer votre email';
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    this.authService.forgotPassword(this.email.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        this.emailSent = true;
        this.message = response.message;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Une erreur est survenue';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
