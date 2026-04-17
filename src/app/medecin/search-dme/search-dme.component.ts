import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PatientService, Patient } from '../../core/services/patient.service';

@Component({
  selector: 'app-search-dme',
  templateUrl: './search-dme.component.html'
})
export class SearchDmeComponent implements OnInit {
  search = '';
  results: Patient[] = [];
  patients: Patient[] = [];
  loading = true;
  error = '';

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients = patients;
        this.results = patients;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors du chargement des patients';
        this.loading = false;
      }
    });
  }

  filter(): void {
    const searchLower = this.search.toLowerCase().trim();
    if (!searchLower) {
      this.results = this.patients;
      return;
    }

    this.results = this.patients.filter(p =>
      p.nom.toLowerCase().includes(searchLower) ||
      p.prenom.toLowerCase().includes(searchLower) ||
      p.email.toLowerCase().includes(searchLower)
    );
  }

  viewDme(patient: Patient): void {
    if (patient.dme) {
        this.router.navigate(['/medecin/dme', patient._id]);
    } else {
      // Charger le DME du patient
      this.patientService.getDmeByPatientId(patient._id).subscribe({
        next: (dme) => {
            this.router.navigate(['/medecin/dme', patient._id]);
        },
        error: () => {
          this.error = 'DME non trouvé pour ce patient';
        }
      });
    }
  }

}
