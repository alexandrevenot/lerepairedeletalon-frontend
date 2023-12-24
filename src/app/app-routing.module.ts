import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './features/authentication/register/register.component';
import { LoginComponent } from './features/authentication/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SearchComponent } from './features/search/search.component';
import { StallionProfileComponent } from './features/search/stallion-profile/stallion-profile.component';
import { ReviewsComponent } from './features/dashboard/reviews/reviews.component';
import { PasswordUpdateComponent } from './features/mail-links/password-update/password-update.component';

const routes: Routes = [
  {path: '', redirectTo: '/search', pathMatch: 'full'},
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'search', component: SearchComponent},
  {path: 'stallion-profile', component: StallionProfileComponent},
  {path: 'user-reviews', component: ReviewsComponent},
  {path: 'password-update', component: PasswordUpdateComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
