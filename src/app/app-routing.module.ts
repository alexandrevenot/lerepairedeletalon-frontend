import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './features/authentication/register/register.component';
import { LoginComponent } from './features/authentication/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { SearchComponent } from './features/search/search.component';
import { StallionProfileComponent } from './features/search/stallion-profile/stallion-profile.component';
import { ReviewsComponent } from './features/dashboard/reviews/reviews.component';
import { PasswordUpdateComponent } from './features/mail-links/password-update/password-update.component';
import { EmailVerificationComponent } from './features/mail-links/email-verification/email-verification.component';
import { CgvComponent } from './layout/static-pages/cgv/cgv.component';
import { CguComponent } from './layout/static-pages/cgu/cgu.component';
import { MentionsLegalesComponent } from './layout/static-pages/mentions-legales/mentions-legales.component';
import { ThisWebsiteComponent } from './layout/static-pages/this-website/this-website.component';

const routes: Routes = [
  {path: '', redirectTo: '/search', pathMatch: 'full'},
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'search', component: SearchComponent},
  {path: 'stallion-profile', component: StallionProfileComponent},
  {path: 'user-reviews', component: ReviewsComponent},
  {path: 'password-update', component: PasswordUpdateComponent},
  {path: 'email-verification', component: EmailVerificationComponent},
  {path: 'cgv', component: CgvComponent},
  {path: 'cgu', component: CguComponent},
  {path: 'mentions-legales', component: MentionsLegalesComponent},
  {path: 'this-website', component: ThisWebsiteComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
