import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService, Patient } from '../../core/services/patient.service';
import { DmeService } from '../../core/services/dme.service';

@Component({
  selector: 'app-add-consultation',
  templateUrl: './add-consultation.component.html'
})
export class AddConsultationComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatientId = '';
  patientDme: any = null;

  data = {
    diagnostic: '',
    traitement: '',
    notes: ''
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

    if (!this.data.diagnostic.trim()) {
      this.error = 'Le diagnostic est obligatoire';
      return;
    }

    if (!this.patientDme) {
      this.error = 'DME non trouvé pour ce patient';
      return;
    }

    this.loading = true;

    this.dmeService.addConsultation({
      patientId: this.selectedPatientId,
      dmeId: this.patientDme._id,
      diagnostic: this.data.diagnostic.trim(),
      traitement: this.data.traitement.trim() || undefined,
      notes: this.data.notes.trim() || undefined
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Consultation ajoutée avec succès';
        this.resetForm();
        setTimeout(() => this.router.navigate(['/medecin/dashboard']), 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de l\'ajout';
      }
    });
  }

  resetForm(): void {
    this.data = { diagnostic: '', traitement: '', notes: '' };
  }

  cancel(): void {
    this.router.navigate(['/medecin/dashboard']);
  }
}
