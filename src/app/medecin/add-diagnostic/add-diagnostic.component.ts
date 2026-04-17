import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PatientService, Patient } from '../../core/services/patient.service';
import { DmeService } from '../../core/services/dme.service';

@Component({
  selector: 'app-add-diagnostic',
  templateUrl: './add-diagnostic.component.html',
  styleUrls: ['./add-diagnostic.component.css']
})
export class AddDiagnosticComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatientId = '';
  selectedPatient: Patient | null = null;
  patientDme: any = null;

  diagnostic = '';
  traitement = '';
  notes = '';

  loading = false;
  loadingPatients = true;
  error = '';
  success = '';

  constructor(
    private patientService: PatientService,
    private dmeService: DmeService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadPatients();

    // Vérifier si un patient est passé en paramètre
    const patientId = this.route.snapshot.queryParams['patientId'];
    if (patientId) {
      this.selectedPatientId = patientId;
      this.onPatientSelect();
    }
  }

  loadPatients(): void {
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.loadingPatients = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des patients';
        this.loadingPatients = false;
      }
    });
  }

  onPatientSelect(): void {
    if (!this.selectedPatientId) {
      this.selectedPatient = null;
      this.patientDme = null;
      return;
    }

    this.selectedPatient = this.patients.find(p => p._id === this.selectedPatientId) || null;

    // Charger le DME du patient
    this.patientService.getDmeByPatientId(this.selectedPatientId).subscribe({
      next: (dme) => {
        this.patientDme = dme;
      },
      error: (err) => {
        console.error('Erreur chargement DME:', err);
        this.patientDme = null;
      }
    });
  }

  submit(): void {
    this.error = '';
    this.success = '';

    if (!this.selectedPatientId) {
      this.error = 'Veuillez sélectionner un patient';
      return;
    }

    if (!this.diagnostic.trim()) {
      this.error = 'Le diagnostic est obligatoire';
      return;
    }

    if (!this.patientDme) {
      this.error = 'DME non trouvé pour ce patient';
      return;
    }

    this.loading = true;

    const consultationData = {
      patientId: this.selectedPatientId,
      dmeId: this.patientDme._id,
      diagnostic: this.diagnostic.trim(),
      traitement: this.traitement.trim() || undefined,
      notes: this.notes.trim() || undefined
    };

    this.dmeService.addConsultation(consultationData).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'Diagnostic ajouté avec succès';
        this.resetForm();

        // Rediriger vers le DME du patient après 2 secondes
        setTimeout(() => {
              this.router.navigate(['/medecin/dme', this.selectedPatientId]);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Erreur lors de l\'ajout du diagnostic';
      }
    });
  }

  resetForm(): void {
    this.diagnostic = '';
    this.traitement = '';
    this.notes = '';
  }

  cancel(): void {
    this.router.navigate(['/medecin/dashboard']);
  }
}
