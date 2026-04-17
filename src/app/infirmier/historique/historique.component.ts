import { Component, OnInit } from '@angular/core';
import { MedicalDataService } from '../../core/services/medical-data.service';

@Component({
  selector: 'app-historique',
  templateUrl: './historique.component.html',
  styleUrls: ['./historique.component.css']
})
export class HistoriqueComponent implements OnInit {
loading = false;
error = '';
historiques: Array<{ date: string; description: string }> = [];

constructor(private readonly medicalDataService: MedicalDataService) {}

ngOnInit(): void {
  this.loadHistorique();
}

loadHistorique(): void {
  this.loading = true;
  this.error = '';

  this.medicalDataService.getConsultations().subscribe({
    next: (consultations) => {
      this.historiques = consultations
        .slice()
        .reverse()
        .slice(0, 25)
        .map((consultation) => ({
          date: consultation.date || '',
          description: `${consultation.diagnostic || 'Consultation'} - ${consultation.traitement || 'Traitement non renseigné'}`
        }));
      this.loading = false;
    },
    error: (err) => {
      this.error = err?.error?.message || 'Impossible de charger l’historique.';
      this.loading = false;
    }
  });
}
}
