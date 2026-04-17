import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService, Patient } from '../../core/services/patient.service';
import { DmeService } from '../../core/services/dme.service';

@Component({
  selector: 'app-create-analyse-request',
  templateUrl: './create-analyse-request.component.html'
})
export class CreateAnalyseRequestComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatientId = '';
  patientDme: any = null;

  analyse = {
    type: '',
    description: ''
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

    if (!this.analyse.type.trim()) {
      this.error = 'Le type d\'analyse est obligatoire';
      return;
    }

    if (!this.patientDme) {
      this.error = 'DME non trouvé pour ce patient';
      return;
    }

    this.loading = true;

    this.dmeService.addDemandeAnalyse({
      patientId: this.selectedPatientId,
      dmeId: this.patientDme._id,
      typeAnalyse: this.analyse.type.trim(),
      description: this.analyse.description.trim() || undefined
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Demande d\'analyse créée avec succès';
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
    this.analyse = { type: '', description: '' };
  }

  cancel(): void {
    this.router.navigate(['/medecin/dashboard']);
  }
}
