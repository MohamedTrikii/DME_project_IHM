import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { SharedModule } from '../shared/shared.module';
import { DossierComponent } from './dossier/dossier.component';
import { ObservationsComponent } from './observations/observations.component';
import { HistoriqueComponent } from './historique/historique.component';
import { InfirmierDashboardComponent } from './dashboard/dashboard.component';



@NgModule({
  declarations: [
    DossierComponent,
    ObservationsComponent,
    HistoriqueComponent,
    InfirmierDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule
  ]
})
export class InfirmierModule { }
