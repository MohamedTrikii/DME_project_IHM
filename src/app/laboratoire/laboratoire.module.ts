import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from '../shared/shared.module';
import { DemandesComponent } from './demandes/demandes.component';
import { RendezvousComponent } from './rendezvous/rendezvous.component';
import { UploadResultComponent } from './upload-result/upload-result.component';
import { LaboratoireDashboardComponent } from './dashboard/dashboard.component';



@NgModule({
  declarations: [
    DemandesComponent,
    RendezvousComponent,
    UploadResultComponent,
    LaboratoireDashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ]
})
export class LaboratoireModule { }
