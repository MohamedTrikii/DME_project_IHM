import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService, Patient } from '../../core/services/patient.service';
import { DmeService } from '../../core/services/dme.service';

@Component({
  selector: 'app-create-ordonnance',
  templateUrl: './create-ordonnance.component.html'
})
export class CreateOrdonnanceComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatientId = '';
  patientDme: any = null;

  ordonnance = {
    medicament: '',
    posologie: '',
    duree: '',
    dateLimite: ''
  };

  loading = false;
  loadingPatients = true;
  error = '';
  success = '';

  constructor(
    private patientService: PatientService,
    private dmeService: DmeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.loadingPatients = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des patients';
        this.loadingPatients = false;
      }
    });
  }

  onPatientSelect(): void {
    if (!this.selectedPatientId) {
      this.patientDme = null;
      return;
    }

    this.patientService.getDmeByPatientId(this.selectedPatientId).subscribe({
      next: (dme) => this.patientDme = dme,
      error: () => this.patientDme = null
    });
  }

  submit(): void {
    this.error = '';
    this.success = '';

    if (!this.selectedPatientId) {
      this.error = 'Veuillez sélectionner un patient';
      return;
    }

    if (!this.ordonnance.medicament.trim()) {
      this.error = 'Le médicament est obligatoire';
      return;
    }

    if (!this.patientDme) {
      this.error = 'DME non trouvé pour ce patient';
      return;
    }

    this.loading = true;

    this.dmeService.addOrdonnance({
      patientId: this.selectedPatientId,
      dmeId: this.patientDme._id,
      medicament: this.ordonnance.medicament.trim(),
      posologie: this.ordonnance.posologie.trim() || undefined,
      duree: this.ordonnance.duree.trim() || undefined,
      dateLimite: this.ordonnance.dateLimite ? new Date(this.ordonnance.dateLimite) : undefined
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Ordonnance créée avec succès';
        this.resetForm();
        setTimeout(() => this.router.navigate(['/medecin/dashboard']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de la création';
      }
    });
  }

  resetForm(): void {
    this.ordonnance = { medicament: '', posologie: '', duree: '', dateLimite: '' };
  }

  cancel(): void {
    this.router.navigate(['/medecin/dashboard']);
  }
}
