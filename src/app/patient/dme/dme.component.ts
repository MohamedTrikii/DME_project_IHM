import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MedicalDataService } from '../../core/services/medical-data.service';

@Component({
  selector: 'app-dme',
  templateUrl: './dme.component.html',
  styleUrls: ['./dme.component.css']
})
export class DmeComponent implements OnInit {
  loading = false;
  error = '';
  dme: any = null;
  consultations: any[] = [];
  ordonnances: any[] = [];
  demandes: any[] = [];
  resultats: any[] = [];
  observations: any[] = [];

  constructor(
    private readonly medicalDataService: MedicalDataService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadDme();
  }

  loadDme(): void {
    const userId = this.authService.getCurrentUser()?._id;
    if (!userId) {
      this.error = 'Utilisateur non connecté.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.medicalDataService.getDmeByPatientId(userId).subscribe({
      next: (data) => {
        this.dme = data;
        this.consultations = data?.consultations || [];
        this.ordonnances = data?.ordonnances || [];
        this.demandes = data?.demandes || [];
        this.resultats = data?.resultats || [];
        this.observations = data?.observations || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de charger le dossier médical.';
        this.loading = false;
      }
    });
  }
}
