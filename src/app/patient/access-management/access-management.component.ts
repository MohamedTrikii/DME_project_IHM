import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { PatientService } from '../../core/services/patient.service';
import { MedicalDataService } from '../../core/services/medical-data.service';

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
medecinId = '';

accessList: Array<{ nom: string; role: string; id: string }> = [];

constructor(
  private readonly authService: AuthService,
  private readonly patientService: PatientService,
  private readonly medicalDataService: MedicalDataService
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
  if (!this.patientId || !this.medecinId.trim()) {
    this.error = 'Veuillez saisir un ID médecin valide.';
    return;
  }

  this.loading = true;
  this.error = '';
  this.message = '';

  this.patientService.grantAccess(this.patientId, this.medecinId.trim()).subscribe({
    next: () => {
      this.message = 'Accès ajouté avec succès.';
      this.medecinId = '';
      this.loadAccess();
    },
    error: (err) => {
      this.error = err?.error?.message || 'Impossible d’ajouter l’accès.';
      this.loading = false;
    }
  });
}

revoke(a: any) {
  this.message = `Révocation non supportée par l'API actuelle (ID: ${a?.id || 'N/A'}).`;
}
}
