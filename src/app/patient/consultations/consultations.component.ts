import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ConsultationItem, MedicalDataService } from '../../core/services/medical-data.service';

@Component({
  selector: 'app-consultations',
  templateUrl: './consultations.component.html',
  styleUrls: ['./consultations.component.css']
})
export class ConsultationsComponent implements OnInit {

  search = '';
  loading = false;
  error = '';
  consultations: ConsultationItem[] = [];

  constructor(
    private readonly medicalDataService: MedicalDataService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    const userId = this.authService.getCurrentUser()?._id;
    if (!userId) {
      this.error = 'Utilisateur non connecté.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.medicalDataService.getConsultations().subscribe({
      next: (data) => {
        this.consultations = data.filter((consultation) => this.extractPatientId(consultation.dme) === userId);
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de charger les consultations.';
        this.loading = false;
      }
    });
  }

  filteredConsultations() {
    const query = this.search.trim().toLowerCase();
    if (!query) {
      return this.consultations;
    }

    return this.consultations.filter(c =>
      `${c.diagnostic || ''} ${c.traitement || ''} ${c.date || ''}`.toLowerCase().includes(query)
    );
  }

  private extractPatientId(dmeRef: ConsultationItem['dme']): string {
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