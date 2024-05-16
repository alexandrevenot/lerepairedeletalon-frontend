import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegisterComponent } from './features/authentication/register/register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './features/authentication/login/login.component';
import { httpInterceptorProviders } from './core/http-interceptors/index';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { StallionComponent } from './features/dashboard/my-stallions/stallion/stallion.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DashboardStallionBoxComponent } from './features/dashboard/my-stallions/my-stallions-list/dashboard-stallion-box/dashboard-stallion-box.component';
import { MyStallionsListComponent } from './features/dashboard/my-stallions/my-stallions-list/my-stallions-list.component';
import { SearchComponent } from './features/search/search.component';
import { StallionPanelComponent } from './features/search/stallion-panel/stallion-panel.component';
import { FiltersComponent } from './features/search/filters/filters.component';
import { StallionPanelItemComponent } from './features/search/stallion-panel/stallion-panel-item/stallion-panel-item.component';
import { StallionProfileComponent } from './features/search/stallion-profile/stallion-profile.component';
import { MyCoversComponent } from './features/dashboard/my-covers/my-covers.component';
import { CoverBoxComponent } from './features/dashboard/my-covers/cover-box/cover-box.component';
import { CoverPageComponent } from './features/dashboard/my-covers/cover-page/cover-page.component';
import { CoverPageActionComponent } from './features/dashboard/my-covers/cover-page/cover-page-action/cover-page-action.component';
import { FavoriteStallionsComponent } from './features/dashboard/favorite-stallions/favorite-stallions.component';
import { FavoriteStallionBoxComponent } from './features/dashboard/favorite-stallions/favorite-stallion-box/favorite-stallion-box.component';
import { MyAccountComponent } from './features/dashboard/my-account/my-account.component';
import { ReviewsComponent } from './features/dashboard/reviews/reviews.component';
import { PasswordUpdateComponent } from './features/mail-links/password-update/password-update.component';
import { FooterComponent } from './layout/footer/footer.component';
import { EmailVerificationComponent } from './features/mail-links/email-verification/email-verification.component';
import { CgvComponent } from './layout/static-pages/cgv/cgv.component';
import { CguComponent } from './layout/static-pages/cgu/cgu.component';
import { MentionsLegalesComponent } from './layout/static-pages/mentions-legales/mentions-legales.component';
import { ThisWebsiteComponent } from './layout/static-pages/this-website/this-website.component';

@NgModule({
  declarations: [
    AppComponent,
    RegisterComponent,
    LoginComponent,
    NavbarComponent,
    StallionComponent,
    DashboardComponent,
    DashboardStallionBoxComponent,
    MyStallionsListComponent,
    SearchComponent,
    StallionPanelComponent,
    FiltersComponent,
    StallionPanelItemComponent,
    StallionProfileComponent,
    MyCoversComponent,
    CoverBoxComponent,
    CoverPageComponent,
    CoverPageActionComponent,
    FavoriteStallionsComponent,
    FavoriteStallionBoxComponent,
    MyAccountComponent,
    ReviewsComponent,
    PasswordUpdateComponent,
    FooterComponent,
    EmailVerificationComponent,
    CgvComponent,
    CguComponent,
    MentionsLegalesComponent,
    ThisWebsiteComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
