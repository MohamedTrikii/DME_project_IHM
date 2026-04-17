import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {
  user = {
    nom: '',
    prenom: '',
    email: '',
    role: 'medecin',
    mot_de_passe: ''
  };
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private readonly adminService: AdminService, private readonly router: Router) {}

  save(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.user.nom || !this.user.prenom || !this.user.email || !this.user.mot_de_passe || !this.user.role) {
      this.errorMsg = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.isLoading = true;

    this.adminService.createUser(this.user).subscribe({
      next: () => {
        this.successMsg = 'Utilisateur cree avec succes.';
        this.isLoading = false;
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Creation impossible.';
        this.isLoading = false;
      }
    });
  }
}
