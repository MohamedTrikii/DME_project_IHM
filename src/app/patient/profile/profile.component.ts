import { Component, OnInit } from '@angular/core';
import { AuthService, AuthUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
loading = false;
error = '';
patient: Partial<AuthUser> = {};

constructor(private readonly authService: AuthService) {}

ngOnInit(): void {
  this.loadProfile();
}

loadProfile(): void {
  this.loading = true;
  this.error = '';

  this.authService.fetchProfile().subscribe({
    next: (user) => {
      this.patient = user;
      this.loading = false;
    },
    error: (err) => {
      this.error = err?.error?.message || 'Impossible de charger le profil.';
      this.loading = false;
    }
  });
}
}
