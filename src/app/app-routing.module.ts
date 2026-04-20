import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

// AUTH
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';

// DASHBOARDS
import { DashboardComponent as MedecinDashboardComponent } from './medecin/dashboard/dashboard.component';
import { DashboardComponent as PatientDashboardComponent } from './patient/dashboard/dashboard.component';
import { DashboardComponent as AdminDashboardComponent } from './admin/dashboard/dashboard.component';

// MEDECIN
import { PatientsComponent } from './medecin/patients/patients.component';
import { AddConsultationComponent } from './medecin/add-consultation/add-consultation.component';
import { CreatePatientComponent } from './medecin/create-patient/create-patient.component';
import { EditPatientComponent } from './medecin/edit-patient/edit-patient.component';
import { DmeComponent } from './medecin/dme/dme.component';
import { OrdonnanceComponent } from './medecin/ordonnance/ordonnance.component';
import { CreateOrdonnanceComponent } from './medecin/create-ordonnance/create-ordonnance.component';
import { CreateAnalyseRequestComponent } from './medecin/create-analyse-request/create-analyse-request.component';
import { SearchDmeComponent } from './medecin/search-dme/search-dme.component';
import { AddDiagnosticComponent } from './medecin/add-diagnostic/add-diagnostic.component';
import { AnalysesComponent } from './patient/analyses/analyses.component';
import { MessagesComponent } from './patient/messages/messages.component';
import { AccessManagementComponent } from './patient/access-management/access-management.component';
import { ProfileComponent } from './patient/profile/profile.component';
import { ConsultationsComponent } from './patient/consultations/consultations.component';
import { OrdonnancesComponent } from './patient/ordonnances/ordonnances.component';

// ADMIN
import { UsersComponent } from './admin/users/users.component';
import { LogsComponent } from './admin/logs/logs.component';
import { AddUserComponent } from './admin/add-user/add-user.component';
import { EditUserComponent } from './admin/edit-user/edit-user.component';
import { ArchiveComponent } from './admin/archive/archive.component';
import { AuditLogsComponent } from './admin/audit-logs/audit-logs.component';

// INFIRMIER
import { DossierComponent } from './infirmier/dossier/dossier.component';
import { HistoriqueComponent } from './infirmier/historique/historique.component';
import { ObservationsComponent } from './infirmier/observations/observations.component';
import { InfirmierDashboardComponent } from './infirmier/dashboard/dashboard.component';

// LABORATOIRE
import { DemandesComponent } from './laboratoire/demandes/demandes.component';
import { RendezvousComponent } from './laboratoire/rendezvous/rendezvous.component';
import { UploadResultComponent } from './laboratoire/upload-result/upload-result.component';
import { LaboratoireDashboardComponent } from './laboratoire/dashboard/dashboard.component';
import { DmeComponent as PatientDmeComponent } from './patient/dme/dme.component';
const routes: Routes = [

  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // AUTH public
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // ADMIN
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'add-user', component: AddUserComponent },
      { path: 'edit-user/:id', component: EditUserComponent },
      { path: 'logs', component: LogsComponent },
      { path: 'audit-logs', component: AuditLogsComponent },
      { path: 'archive', component: ArchiveComponent }
    ]
  },

  // PATIENT
  {
    path: 'patient',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['patient', 'admin'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: PatientDashboardComponent },
      { path: 'consultations', component: ConsultationsComponent },
      { path: 'analyses', component: AnalysesComponent },
      { path: 'messages', component: MessagesComponent },
      { path: 'dme', component: PatientDmeComponent },
      { path: 'ordonnances', component: OrdonnancesComponent },
      { path: 'access-management', component: AccessManagementComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },

  // MEDECIN
  {
    path: 'medecin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['medecin', 'admin'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: MedecinDashboardComponent },

      { path: 'patients', component: PatientsComponent },
      { path: 'create-patient', component: CreatePatientComponent },
      { path: 'edit-patient/:id', component: EditPatientComponent },

      { path: 'dme', component: DmeComponent },
      { path: 'dme/:id', component: DmeComponent },

      { path: 'add-consultation', component: AddConsultationComponent },
      { path: 'add-diagnostic', component: AddDiagnosticComponent },

      { path: 'ordonnance', component: OrdonnanceComponent },
      { path: 'create-ordonnance', component: CreateOrdonnanceComponent },

      { path: 'create-analyse-request', component: CreateAnalyseRequestComponent },

      { path: 'search-dme', component: SearchDmeComponent },

      { path: 'messages', component: MessagesComponent }
    ]
  },

  // INFIRMIER
  {
    path: 'infirmier',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['infirmier', 'admin'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: InfirmierDashboardComponent },
      { path: 'dossier', component: DossierComponent },
      { path: 'historique', component: HistoriqueComponent },
      { path: 'observations', component: ObservationsComponent }
    ]
  },

  // LABORATOIRE
  {
    path: 'laboratoire',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['laboratoire', 'admin'] },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: LaboratoireDashboardComponent },
      { path: 'demandes', component: DemandesComponent },
      { path: 'rendezvous', component: RendezvousComponent },
      { path: 'upload-result', component: UploadResultComponent }
    ]
  },

  // fallback
  { path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }