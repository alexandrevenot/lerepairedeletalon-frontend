import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './features/authentication/register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './features/authentication/login/login.component';
import { httpInterceptorProviders } from './core/http-interceptors/index';
import { AuthService } from './core/auth/auth.service';
import { ProtectedRessourceComponent } from './features/protected-ressource/protected-ressource.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { RegisterNewStallionComponent } from './features/dashboard/my-stallions/register-new-stallion/register-new-stallion.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { MyStallionsComponent } from './features/dashboard/my-stallions/my-stallions.component';
import { SettingsComponent } from './features/dashboard/settings/settings.component';
import { DashboardStallionBoxComponent } from './features/dashboard/my-stallions/my-stallions-list/dashboard-stallion-box/dashboard-stallion-box.component';
import { MyStallionsListComponent } from './features/dashboard/my-stallions/my-stallions-list/my-stallions-list.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    ProtectedRessourceComponent,
    NavbarComponent,
    RegisterNewStallionComponent,
    DashboardComponent,
    MyStallionsComponent,
    SettingsComponent,
    DashboardStallionBoxComponent,
    MyStallionsListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    httpInterceptorProviders,
    AuthService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }