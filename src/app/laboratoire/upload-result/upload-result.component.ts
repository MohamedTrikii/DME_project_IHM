import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MedicalDataService } from '../../core/services/medical-data.service';

@Component({
  selector: 'app-upload-result',
  templateUrl: './upload-result.component.html',
  styleUrls: ['./upload-result.component.css']
})
export class UploadResultComponent implements OnInit {
  file: File | null = null;
  fileName = '';
  loading = false;
  error = '';
  message = '';
  selectedDemandeId = '';
  resultatText = '';
  interpretation = '';
  demandes: Array<{
    id: string;
    label: string;
    patient: string;
    type: string;
    status: string;
  }> = [];

  constructor(
    private readonly medicalDataService: MedicalDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDemandes();

    // Récupérer l'ID de la demande depuis les query params
    const demandeId = this.route.snapshot.queryParams['demandeId'];
    if (demandeId) {
      this.selectedDemandeId = demandeId;
    }
  }

  loadDemandes(): void {
    this.loading = true;
    this.error = '';

    this.medicalDataService.getDemandesAnalyses().subscribe({
      next: (demandes) => {
        // Filtrer pour n'afficher que les demandes en cours
        this.demandes = demandes
          .filter((d: any) => d?.statut === 'en cours' || d?.statut === 'en attente')
          .map((demande: any) => {
            const patientName =
              typeof demande?.patient === 'object'
                ? `${demande.patient.nom || ''} ${demande.patient.prenom || ''}`.trim()
                : 'Patient';

            return {
              id: demande?._id || '',
              label: `${demande?.typeAnalyse || 'Analyse'} - ${patientName}`,
              patient: patientName,
              type: demande?.typeAnalyse || 'N/A',
              status: demande?.statut || 'N/A'
            };
          });

        if (!this.selectedDemandeId && this.demandes.length > 0) {
          this.selectedDemandeId = this.demandes[0].id;
        }

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de charger les demandes.';
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any): void {
    this.file = event.target.files?.[0] || null;
    this.fileName = this.file?.name || '';
  }

  upload(): void {
    if (!this.selectedDemandeId) {
      this.error = 'Veuillez sélectionner une demande.';
      return;
    }

    if (!this.resultatText.trim()) {
      this.error = 'Veuillez saisir un résultat.';
      return;
    }

    this.loading = true;
    this.error = '';
    this.message = '';

    this.medicalDataService
      .createResultat({
        demande: this.selectedDemandeId,
        resultat: this.resultatText.trim(),
        interpretation: this.interpretation.trim() || undefined
      })
      .subscribe({
        next: () => {
          this.message = 'Résultat enregistré avec succès!';
          this.resultatText = '';
          this.interpretation = '';
          this.file = null;
          this.fileName = '';
          this.loading = false;

          // Retourner à la liste des demandes après 2 secondes
          setTimeout(() => {
            this.router.navigate(['/laboratoire/demandes']);
          }, 2000);
        },
        error: (err) => {
          this.error = err?.error?.message || 'Impossible d\'enregistrer le résultat.';
          this.loading = false;
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/laboratoire/demandes']);
  }
}
