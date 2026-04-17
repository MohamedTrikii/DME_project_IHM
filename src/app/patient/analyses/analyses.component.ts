import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import {
  DemandeAnalyseItem,
  MedicalDataService,
  ResultatItem
} from '../../core/services/medical-data.service';

interface AnalyseView {
  demandeId: string;
  name: string;
  date: string;
  status: string;
  resultat?: string;
}

@Component({
  selector: 'app-analyses',
  templateUrl: './analyses.component.html',
  styleUrls: ['./analyses.component.css']
})
export class AnalysesComponent implements OnInit {

  loading = false;
  error = '';
  analyses: AnalyseView[] = [];

  constructor(
    private readonly medicalDataService: MedicalDataService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAnalyses();
  }

  loadAnalyses(): void {
    const userId = this.authService.getCurrentUser()?._id;
    if (!userId) {
      this.error = 'Utilisateur non connecté.';
      return;
    }

    this.loading = true;
    this.error = '';

    forkJoin({
      demandes: this.medicalDataService.getDemandesAnalyses(),
      resultats: this.medicalDataService.getResultats()
    }).subscribe({
      next: ({ demandes, resultats }) => {
        const patientDemandes = demandes.filter((demande) => this.extractPatientIdFromDemande(demande) === userId);
        this.analyses = patientDemandes.map((demande) => {
          const demandeId = demande._id || '';
          const relatedResultat = resultats.find((item) => this.extractDemandeId(item) === demandeId);

          return {
            demandeId,
            name: demande.typeAnalyse || 'Analyse',
            date: demande.dateDemande || '',
            status: relatedResultat ? 'disponible' : (demande.statut || 'en-attente'),
            resultat: relatedResultat?.resultat
          };
        });

        this.loading = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de charger les analyses.';
        this.loading = false;
      }
    });
  }

  private extractPatientIdFromDemande(demande: DemandeAnalyseItem): string {
    if (!demande.dme || typeof demande.dme === 'string') {
      return '';
    }

    if (!demande.dme.patient) {
      return '';
    }

    if (typeof demande.dme.patient === 'string') {
      return demande.dme.patient;
    }

    return demande.dme.patient._id || '';
  }

  private extractDemandeId(resultat: ResultatItem): string {
    if (!resultat.demande) {
      return '';
    }

    if (typeof resultat.demande === 'string') {
      return resultat.demande;
    }

    return resultat.demande._id || '';
  }

}