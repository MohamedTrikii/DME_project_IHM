import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Patient, PatientService } from '../../core/services/patient.service';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html'
})
export class PatientsComponent implements OnInit {
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  isLoading = false;
  errorMsg = '';
  searchQuery = '';

  constructor(private readonly patientService: PatientService, private readonly router: Router) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading = true;
    this.errorMsg = '';

    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients = Array.isArray(patients) ? patients : [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Impossible de charger les patients.';
        this.isLoading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredPatients = [...this.patients];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.filteredPatients = this.patients.filter(p =>
      p.nom?.toLowerCase().includes(q) ||
      p.prenom?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q)
    );
  }

  onSearch(): void {
    this.applyFilter();
  }

  initials(p: Patient): string {
    return (p.prenom?.charAt(0) ?? '') + (p.nom?.charAt(0) ?? '');
  }

  edit(id?: string): void {
    if (id) this.router.navigate(['/medecin/edit-patient', id]);
  }

  openDme(id?: string): void {
    if (id) this.router.navigate(['/medecin/dme'], { queryParams: { patientId: id } });
  }
}
