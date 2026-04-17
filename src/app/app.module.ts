import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

// Angular Material (optionnel ici si déjà dans SharedModule)
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';

// Modules
import { SharedModule } from './shared/shared.module'; // ✅ IMPORTANT
import { AuthModule } from './auth/auth.module';
import { MedecinModule } from './medecin/medecin.module';
import { PatientModule } from './patient/patient.module';
import { AdminModule } from './admin/admin.module';
import { InfirmierModule } from './infirmier/infirmier.module';
import { LaboratoireModule } from './laboratoire/laboratoire.module';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// Layout uniquement ici
import { LayoutComponent } from './shared/layout/layout.component';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent // ✅ فقط layout ici
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // Shared (contient header, sidebar, footer + material)
    SharedModule,

    // Feature modules
    AuthModule,
    MedecinModule,
    PatientModule,
    AdminModule,
    InfirmierModule,
    LaboratoireModule,

    // Material minimal (optionnel)
    MatToolbarModule,
    MatListModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }