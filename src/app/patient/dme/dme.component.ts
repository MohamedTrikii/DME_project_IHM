import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadDme();
  }

  loadDme(): void {
    // Vérifie s'il y a un paramètre patientId dans l'URL
    const patientId = this.route.snapshot.queryParamMap.get('patientId');
    let userId = patientId;

    // Si pas de patientId, on prend l'utilisateur connecté
    if (!userId) {
      const user = localStorage.getItem('user');
      const parsedUser = user ? JSON.parse(user) : null;
      userId = parsedUser?._id;
      // userId = parsedUser?.id;  
      console.log('parsedUser:', parsedUser);  // 👈 ajoute ça
      console.log('userId:', userId);  
    }
    // }

    if (!userId) {
      this.error = 'Aucun patient sélectionné.';
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
