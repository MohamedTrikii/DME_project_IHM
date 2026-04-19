import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

// HTTP Client
import { HttpClientModule } from '@angular/common/http';

// Shared Module
import { SharedModule } from '../shared/shared.module';

// Components
import { AddConsultationComponent } from './add-consultation/add-consultation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PatientsComponent } from './patients/patients.component';
import { CreatePatientComponent } from './create-patient/create-patient.component';
import { EditPatientComponent } from './edit-patient/edit-patient.component';
import { DmeComponent } from './dme/dme.component';
import { OrdonnanceComponent } from './ordonnance/ordonnance.component';
import { CreateOrdonnanceComponent } from './create-ordonnance/create-ordonnance.component';
import { CreateAnalyseRequestComponent } from './create-analyse-request/create-analyse-request.component';
import { SearchDmeComponent } from './search-dme/search-dme.component';
import { AddDiagnosticComponent } from './add-diagnostic/add-diagnostic.component';
import { MedecinMessagesComponent } from './messages/messages.component';

@NgModule({
  declarations: [
    AddConsultationComponent,
    DashboardComponent,
    PatientsComponent,
    CreatePatientComponent,
    EditPatientComponent,
    DmeComponent,
    OrdonnanceComponent,
    CreateOrdonnanceComponent,
    CreateAnalyseRequestComponent,
    SearchDmeComponent,
    AddDiagnosticComponent,
    MedecinMessagesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatIconModule
  ],
  exports: [
    PatientsComponent
  ]
})
export class MedecinModule {}