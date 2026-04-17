import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

// Shared Module
import { SharedModule } from '../shared/shared.module';

// Components
import { DashboardComponent } from './dashboard/dashboard.component';
import { AnalysesComponent } from './analyses/analyses.component';
import { ConsultationsComponent } from './consultations/consultations.component';
import { MessagesComponent } from './messages/messages.component';
import { OrdonnancesComponent } from './ordonnances/ordonnances.component';
import { ProfileComponent } from './profile/profile.component';
import { DmeComponent } from './dme/dme.component';
import { AccessManagementComponent } from './access-management/access-management.component';

@NgModule({
  declarations: [
    DashboardComponent,
    AnalysesComponent,
    ConsultationsComponent,
    MessagesComponent,
    OrdonnancesComponent,
    ProfileComponent,
    DmeComponent,
    AccessManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,

    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class PatientModule { }