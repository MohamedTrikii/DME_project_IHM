import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedicalDataService } from '../../core/services/medical-data.service';

@Component({
  selector: 'app-dossier',
  templateUrl: './dossier.component.html',
  styleUrls: ['./dossier.component.css']
})
export class DossierComponent implements OnInit {
  loading = false;
  error = '';
  searchQuery = '';

  allPatients: Array<{ nom: string; age: string; dmeId: string; dmeNumero: string }> = [];
  patients: Array<{ nom: string; age: string; dmeId: string; dmeNumero: string }> = [];

  constructor(
    private readonly medicalDataService: MedicalDataService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadDossiers();
  }

  loadDossiers(): void {
    this.loading = true;
    this.error = '';

    this.medicalDataService.getAllDmes().subscribe({
      next: (dmes) => {
        this.allPatients = dmes.map((dme: any) => ({
          nom: `${dme?.patient?.nom || ''} ${dme?.patient?.prenom || ''}`.trim() || 'Patient inconnu',
          age: dme?.patient?.dateNais ? this.computeAge(dme.patient.dateNais) : 'N/A',
          dmeId: dme?._id || '',
          dmeNumero: dme?.dmeId || ''
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de charger les dossiers.';
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (!this.searchQuery.trim()) {
      this.patients = [...this.allPatients];
      return;
    }
    const q = this.searchQuery.toLowerCase();
    this.patients = this.allPatients.filter(p => p.nom.toLowerCase().includes(q));
  }

  onSearch(): void {
    this.applyFilter();
  }

  viewObservations(dmeId: string): void {
    this.router.navigate(['/infirmier/observations'], { queryParams: { dmeId } });
  }

  private computeAge(dateNais: string): string {
    const birth = new Date(dateNais);
    if (Number.isNaN(birth.getTime())) return 'N/A';
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const passed = now.getMonth() > birth.getMonth() ||
      (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());
    if (!passed) age -= 1;
    return `${age} ans`;
  }
}

