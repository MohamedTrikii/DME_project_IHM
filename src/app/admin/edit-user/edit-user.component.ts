import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  userId = '';
  user = {
    nom: '',
    prenom: '',
    email: '',
    role: 'medecin'
  };
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.userId) {
      this.errorMsg = 'Utilisateur invalide.';
      return;
    }

    this.loadUser();
  }

  loadUser(): void {
    this.isLoading = true;
    this.adminService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.user = {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role
        };
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Impossible de charger cet utilisateur.';
        this.isLoading = false;
      }
    });
  }

  save(): void {
    this.errorMsg = '';
    this.successMsg = '';

    this.adminService.updateUser(this.userId, this.user).subscribe({
      next: () => {
        this.successMsg = 'Utilisateur mis a jour avec succes.';
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Mise a jour impossible.';
      }
    });
  }

}
