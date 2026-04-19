import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DmeService } from '../../core/services/dme.service';

@Component({
  selector: 'app-dme',
  templateUrl: './dme.component.html',
  styleUrls: ['./dme.component.css']
})
export class DmeComponent implements OnInit {
  dme: any = null;
  patient: any = null;
  consultations: any[] = [];
  ordonnances: any[] = [];
  demandes: any[] = [];
  resultats: any[] = [];
  observations: any[] = [];

  loading = true;
  creating = false;
  error = '';
  dmeNotFound = false;
  patientId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dmeService: DmeService
  ) {}

  ngOnInit(): void {
  const user = localStorage.getItem('user');
  const parsedUser = user ? JSON.parse(user) : null;

  const patientId = parsedUser?._id;

  console.log("PATIENT ID:", patientId);

  if (patientId) {
    this.loadDme(patientId);
  } else {
    this.error = 'Utilisateur non connecté';
    this.loading = false;
  }
}

  loadDme(patientId: string): void {
    this.loading = true;
    this.error = '';
    this.dmeNotFound = false;

    this.dmeService.getDmeByPatient(patientId).subscribe({
      next: (dme) => {
        this.dme = dme;
        this.patient = dme.patient;
        this.consultations = dme.consultations || [];
        this.ordonnances = dme.ordonnances || [];
        this.demandes = dme.demandes || [];
        this.resultats = dme.resultats || [];
        this.observations = dme.observations || [];
        this.loading = false;
      },
      error: (err) => {
        if (err.status === 404) {
          this.dmeNotFound = true;
        } else {
          this.error = err.error?.message || 'Erreur lors du chargement du DME';
        }
        this.loading = false;
      }
    });
  }

  addConsultation(): void {
    this.router.navigate(['/medecin/add-consultation'], {
      queryParams: { patientId: this.patient?._id }
    });
  }

  addOrdonnance(): void {
    this.router.navigate(['/medecin/create-ordonnance'], {
      queryParams: { patientId: this.patient?._id }
    });
  }

  addAnalyse(): void {
    this.router.navigate(['/medecin/create-analyse-request'], {
      queryParams: { patientId: this.patient?._id }
    });
  }

  goBack(): void {
    this.router.navigate(['/medecin/patients']);
  }

  createDme(): void {
    if (!this.patientId) return;
    this.creating = true;
    this.dmeService.createDme(this.patientId).subscribe({
      next: () => {
        this.creating = false;
        this.dmeNotFound = false;
        this.loadDme(this.patientId);
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création du DME';
        this.creating = false;
      }
    });
  }

  revokeAccess(medecinId: string): void {
    if (!this.dme?._id) return;
    this.dmeService.revokeAccess(this.dme._id, medecinId).subscribe({
      next: (updated) => { this.dme.accesAutorise = updated.accesAutorise; },
      error: (err) => { this.error = err.error?.message || 'Erreur révocation accès'; }
    });
  }
}
