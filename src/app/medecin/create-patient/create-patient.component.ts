import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';

@Component({
  selector: 'app-create-patient',
  templateUrl: './create-patient.component.html'
})
export class CreatePatientComponent {

  patient = {
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    dateNais: '',
    adresse: '',
    telephone: ''
  };
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private readonly patientService: PatientService, private readonly router: Router) {}

  save(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.patient.nom || !this.patient.prenom || !this.patient.email || !this.patient.mot_de_passe) {
      this.errorMsg = 'Nom, prenom, email et mot de passe sont obligatoires.';
      return;
    }

    this.isLoading = true;

    this.patientService.create(this.patient).subscribe({
      next: () => {
        this.successMsg = 'Patient cree avec succes.';
        this.isLoading = false;
        this.router.navigate(['/medecin/patients']);
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Creation du patient impossible.';
        this.isLoading = false;
      }
    });
  }

}