import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';

@Component({
  selector: 'app-edit-patient',
  templateUrl: './edit-patient.component.html'
})
export class EditPatientComponent implements OnInit {
  patientId = '';
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  patient = {
    nom: '',
    prenom: '',
    email: '',
    dateNais: '',
    adresse: '',
    telephone: ''
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly patientService: PatientService
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.params['id'];
    if (!this.patientId) {
      this.errorMsg = 'Patient invalide.';
      return;
    }

    this.loadPatient();
  }

  loadPatient(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.patientService.getById(this.patientId).subscribe({
      next: (patient) => {
        this.patient = {
          nom: patient.nom || '',
          prenom: patient.prenom || '',
          email: patient.email || '',
          dateNais: patient.dateNais || '',
          adresse: patient.adresse || '',
          telephone: patient.telephone || ''
        };
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Impossible de charger le patient.';
        this.isLoading = false;
      }
    });
  }

  update(): void {
    this.errorMsg = '';
    this.successMsg = '';

    this.patientService.update(this.patientId, this.patient).subscribe({
      next: () => {
        this.successMsg = 'Patient mis a jour avec succes.';
        this.router.navigate(['/medecin/patients']);
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Mise a jour impossible.';
      }
    });
  }
}