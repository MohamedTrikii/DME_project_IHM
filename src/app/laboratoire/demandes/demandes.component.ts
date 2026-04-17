import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MedicalDataService } from '../../core/services/medical-data.service';

@Component({
  selector: 'app-demandes',
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.css']
})
export class DemandesComponent implements OnInit {
  loading = false;
  error = '';
  success = '';

  demandes: Array<{
    id: string;
    patient: string;
    medecin: string;
    type: string;
    description: string;
    status: string;
    date: string;
  }> = [];

  constructor(
    private readonly medicalDataService: MedicalDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.error = '';

    this.medicalDataService.getDemandesAnalyses().subscribe({
      next: (data) => {
        this.demandes = data.map((d: any) => {
          const patientName =
            typeof d?.patient === 'object'
              ? `${d.patient.nom || ''} ${d.patient.prenom || ''}`.trim()
              : (typeof d?.dme?.patient === 'object'
                ? `${d.dme.patient.nom || ''} ${d.dme.patient.prenom || ''}`.trim()
                : 'Patient');

          const medecinName =
            typeof d?.medecin === 'object'
              ? `Dr. ${d.medecin.nom || ''} ${d.medecin.prenom || ''}`.trim()
              : 'Médecin';

          return {
            id: d?._id || '',
            patient: patientName || 'Patient',
            medecin: medecinName,
            type: d?.typeAnalyse || 'N/A',
            description: d?.description || '',
            status: d?.statut || 'N/A',
            date: d?.dateDemande || ''
          };
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de charger les demandes.';
        this.loading = false;
      }
    });
  }

  updateStatut(demande: any, newStatut: string): void {
    this.medicalDataService.updateDemandeStatut(demande.id, newStatut).subscribe({
      next: () => {
        demande.status = newStatut;
        this.success = 'Statut mis à jour';
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erreur lors de la mise à jour';
      }
    });
  }

  traiterDemande(demande: any): void {
    // Rediriger vers l'upload de résultat avec l'ID de la demande
    this.router.navigate(['/laboratoire/upload-result'], {
      queryParams: { demandeId: demande.id }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'en attente': return 'status-pending';
      case 'en cours': return 'status-progress';
      case 'termine': return 'status-done';
      case 'annule': return 'status-cancelled';
      default: return '';
    }
  }
}
