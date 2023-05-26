import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './features/authentication/register/register.component';
import { LoginComponent } from './features/authentication/login/login.component';
import { ProtectedRessourceComponent } from './features/protected-ressource/protected-ressource.component'
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RegisterNewStallionComponent } from './features/dashboard/my-stallions/register-new-stallion/register-new-stallion.component';

const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'protected', component: ProtectedRessourceComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'temp', component: RegisterNewStallionComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
