import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { MedicalDataService, OrdonnanceItem } from '../../core/services/medical-data.service';

@Component({
  selector: 'app-ordonnances',
  templateUrl: './ordonnances.component.html'
})
export class OrdonnancesComponent implements OnInit {

  loading = false;
  error = '';
  ordonnances: OrdonnanceItem[] = [];

  constructor(
    private readonly medicalDataService: MedicalDataService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrdonnances();
  }

  loadOrdonnances(): void {
    const userId = this.authService.getCurrentUser()?._id;
    if (!userId) {
      this.error = 'Utilisateur non connecté.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.medicalDataService.getOrdonnances().subscribe({
      next: (data) => {
        this.ordonnances = data.filter((ordonnance) => this.extractPatientId(ordonnance.dme) === userId);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de charger les ordonnances.';
        this.loading = false;
      }
    });
  }

  private extractPatientId(dmeRef: OrdonnanceItem['dme']): string {
    if (!dmeRef || typeof dmeRef === 'string') {
      return '';
    }

    if (!dmeRef.patient) {
      return '';
    }

    if (typeof dmeRef.patient === 'string') {
      return dmeRef.patient;
    }

    return dmeRef.patient._id || '';
  }

}