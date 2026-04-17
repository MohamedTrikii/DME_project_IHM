import { Component, OnInit } from '@angular/core';
import { MedicalDataService } from '../../core/services/medical-data.service';

@Component({
  selector: 'app-rendezvous',
  templateUrl: './rendezvous.component.html',
  styleUrls: ['./rendezvous.component.css']
})
export class RendezvousComponent implements OnInit {
loading = false;
error = '';
rendezvous: Array<{ patient: string; date: string; analyse: string }> = [];

constructor(private readonly medicalDataService: MedicalDataService) {}

ngOnInit(): void {
  this.loadRendezvous();
}

loadRendezvous(): void {
  this.loading = true;
  this.error = '';

  this.medicalDataService.getDemandesAnalyses().subscribe({
    next: (demandes) => {
      this.rendezvous = demandes.map((d: any) => {
        const patientName =
          typeof d?.dme?.patient === 'object'
            ? `${d.dme.patient.nom || ''} ${d.dme.patient.prenom || ''}`.trim()
            : 'Patient';

        return {
          patient: patientName || 'Patient',
          date: d?.dateDemande || '',
          analyse: d?.typeAnalyse || 'N/A'
        };
      });

      this.loading = false;
    },
    error: (err) => {
      this.error = err?.error?.message || 'Impossible de charger les rendez-vous.';
      this.loading = false;
    }
  });
}

add() {
  return;
}
}
