import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PatientService } from '../../core/services/patient.service';
import { MedicalDataService } from '../../core/services/medical-data.service';
import { AdminService, User } from '../../core/services/admin.service';

@Component({
  selector: 'app-access-management',
  templateUrl: './access-management.component.html',
  styleUrls: ['./access-management.component.css']
})
export class AccessManagementComponent implements OnInit {

cols: string[] = ['nom', 'role', 'access'];
loading = false;
error = '';
message = '';
patientId = '';
selectedUser: User | null = null;
userSearch = '';
userResults: User[] = [];
accessList: Array<{ nom: string; role: string; id: string }> = [];

constructor(
  private readonly authService: AuthService,
  private readonly patientService: PatientService,
  private readonly medicalDataService: MedicalDataService,
  private readonly adminService: AdminService
) {}

ngOnInit(): void {
  this.patientId = this.authService.getCurrentUser()?._id || '';
  this.loadAccess();
}

loadAccess(): void {
  if (!this.patientId) {
    this.error = 'Utilisateur non connecté.';
    return;
  }

  this.loading = true;
  this.error = '';
  this.message = '';

  this.medicalDataService.getDmeByPatientId(this.patientId).subscribe({
    next: (dme) => {
      const rawAccess = Array.isArray(dme?.accesAutorise) ? dme.accesAutorise : [];
      this.accessList = rawAccess.map((entry: any) => {
        if (typeof entry === 'string') {
          return { id: entry, nom: entry, role: 'Utilisateur' };
        }

        const fullName = `${entry?.nom || ''} ${entry?.prenom || ''}`.trim() || entry?._id || 'Utilisateur';
        return {
          id: entry?._id || '',
          nom: fullName,
          role: entry?.role || 'Utilisateur'
        };
      });

      this.loading = false;
    },
    error: (err) => {
      this.error = err?.error?.message || 'Impossible de charger les accès.';
      this.loading = false;
    }
  });
}


grant(): void {
  if (!this.patientId || !this.selectedUser?._id) {
    this.error = 'Veuillez sélectionner un utilisateur valide.';
    return;
  }
  this.loading = true;
  this.error = '';
  this.message = '';
  this.patientService.grantAccess(this.patientId, this.selectedUser._id).subscribe({
    next: () => {
      this.message = 'Accès ajouté avec succès.';
      this.selectedUser = null;
      this.userSearch = '';
      this.userResults = [];
      this.loadAccess();
    },
    error: (err) => {
      this.error = err?.error?.message || 'Impossible d’ajouter l’accès.';
      this.loading = false;
    }
  });
}

onUserSearch(): void {
  const q = this.userSearch.trim();
  if (q.length < 2) {
    this.userResults = [];
    return;
  }
  // Recherche sur médecins, infirmiers, laboratoires
  this.adminService.searchUsers(q).subscribe({
    next: (users) => {
      this.userResults = users;
    },
    error: () => {
      this.userResults = [];
    }
  });
}

selectUser(user: User): void {
  this.selectedUser = user;
  this.userSearch = `${user.nom} ${user.prenom} (${user.role})`;
  this.userResults = [];
}

revoke(a: any) {
  if (!this.patientId || !a?.id) {
    this.error = 'Utilisateur ou patient non valide.';
    return;
  }
  this.loading = true;
  this.error = '';
  this.message = '';
  // Appel API pour révoquer l'accès
  this.patientService.revokeAccess(this.patientId, a.id).subscribe({
    next: () => {
      this.message = 'Accès révoqué avec succès.';
      this.loadAccess();
    },
    error: (err) => {
      this.error = err?.error?.message || 'Impossible de révoquer l’accès.';
      this.loading = false;
    }
  });
}
}
