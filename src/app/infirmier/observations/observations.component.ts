import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MedicalDataService } from '../../core/services/medical-data.service';

@Component({
  selector: 'app-observations',
  templateUrl: './observations.component.html',
  styleUrls: ['./observations.component.css']
})
export class ObservationsComponent implements OnInit {
loading = false;
error = '';
message = '';
observations: string[] = [];
dmes: Array<{ id: string; label: string }> = [];
selectedDmeId = '';

newObs = '';

constructor(private readonly medicalDataService: MedicalDataService, private readonly route: ActivatedRoute) {}

ngOnInit(): void {
  const dmeId = this.route.snapshot.queryParams['dmeId'];
  if (dmeId) this.selectedDmeId = dmeId;
  this.loadDmes();
}

loadDmes(): void {
  this.loading = true;
  this.error = '';
  this.message = '';

  this.medicalDataService.getAllDmes().subscribe({
    next: (dmes) => {
      this.dmes = dmes.map((dme: any) => ({
        id: dme?._id || '',
        label: `${dme?.patient?.nom || 'Patient'} ${dme?.patient?.prenom || ''}`.trim()
      }));

      if (!this.selectedDmeId && this.dmes.length > 0) {
        this.selectedDmeId = this.dmes[0].id;
      }

      if (this.selectedDmeId) {
        this.loadObservations();
      } else {
        this.loading = false;
      }
    },
    error: (err) => {
      this.error = err?.error?.message || 'Impossible de charger les dossiers.';
      this.loading = false;
    }
  });
}

loadObservations(): void {
  if (!this.selectedDmeId) {
    this.observations = [];
    return;
  }

  this.loading = true;
  this.error = '';

  this.medicalDataService.getInfirmierDmeById(this.selectedDmeId).subscribe({
    next: (dme) => {
      const raw = Array.isArray(dme?.observations) ? dme.observations : [];
      this.observations = raw.map((obs: any) => obs?.contenu || obs?.description || 'Observation');
      this.loading = false;
    },
    error: (err) => {
      this.error = err?.error?.message || 'Impossible de charger les observations.';
      this.loading = false;
    }
  });
}

add() {
  if (!this.selectedDmeId || !this.newObs.trim()) {
    this.error = 'Veuillez sélectionner un dossier et saisir une observation.';
    return;
  }

  this.loading = true;
  this.error = '';
  this.message = '';

  this.medicalDataService.addInfirmierObservation(this.selectedDmeId, this.newObs.trim()).subscribe({
    next: () => {
      this.message = 'Observation enregistrée.';
      this.newObs = '';
      this.loadObservations();
    },
    error: (err) => {
      this.error = err?.error?.message || "Impossible d'enregistrer l'observation.";
      this.loading = false;
    }
  });
}
}
