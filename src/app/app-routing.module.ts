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
import { ContactComponent } from './layout/static-pages/contact/contact.component';

const routes: Routes = [
  {
    path: 'inscription',
    component: RegisterComponent,
    data: {
      title: "Créez votre compte | Le Repaire de l'Étalon",
      meta: [
        {
          name: 'description',
          content: "Créez votre profil sur Le Repaire de l'Étalon pour pouvoir acheter et vendre des saillies dans la filière équine."
        }
      ]
    }
  },
  {
    path: 'connexion',
    component: LoginComponent,
    data: {
      title: "Connectez vous | Le Repaire de l'Étalon",
      meta: [
        {
          name: 'description',
          content: "Connectez vous à votre compte sur Le Repaire de l'Étalon pour pouvoir acheter et vendre des saillies dans la filière équine."
        }
      ]
    }
  },
  {
    path: 'tableau-de-bord',
    component: DashboardComponent,
    data: {
      title: "Tableau de bord | Le Repaire de l'Étalon",
      meta: [
        {
          name: 'description',
          content: `Retrouvez toutes les informations liées à votre compte Le Repaire de l'Étalon: 
la liste de vos étalons disponibles à la saillie, vos saillies en cours d'achat, vos saillies en cours de vente, 
les évaluations que vous avez reçues et laissées.`
        }
      ]
    }
  },
  {
    path: 'rechercher-un-etalon',
    component: SearchComponent,
    data: {
      title: "Rechercher un étalon | Le Repaire de l'Étalon",
      meta: [
        {
          name: 'description',
          content: "Trouvez un étalon disponible à la saillie pour votre jument parmi tous les profils d'étalons présents sur la plateforme Le Repaire de l'Étalon."
        }
      ]
    }
  },
  {path: 'etalons/:idAndName', component: StallionProfileComponent},
  {path: 'evaluations', component: ReviewsComponent},
  {path: 'password-update', component: PasswordUpdateComponent},
  {path: 'email-verification', component: EmailVerificationComponent},
  {
    path: 'conditions-generales-de-vente',
    component: CgvComponent,
    data: {
      title: "Conditions Générales de Vente | Le Repaire de l'Étalon",
      meta: [
        {
          name: 'description',
          content: "Consultez les Conditions Générales de Vente de la plateforme Le Repaire de l'Étalon."
        },
        {
          name: 'author',
          content: 'Alexandre Venot'
        }
      ]
    }
  },
  {
    path: 'conditions-generales-d-utilisation',
    component: CguComponent,
    data: {
      title: "Conditions Générales d'Utilisation | Le Repaire de l'Étalon",
      meta: [
        {
          name: 'description',
          content: "Consultez les Conditions Générales d'Utilisation de la plateforme Le Repaire de l'Étalon."
        },
        {
          name: 'author',
          content: 'Alexandre Venot'
        }
      ]
    }
  },
  {
    path: 'mentions-legales',
    component: MentionsLegalesComponent,
    data: {
      title: "Mentions Légales | Le Repaire de l'Étalon",
      meta: [
        {
          name: 'description',
          content: "Consultez les Mentions Légales de la plateforme Le Repaire de l'Étalon."
        },
        {
          name: 'author',
          content: 'Alexandre Venot'
        }
      ]
    }
  },
  {
    path: 'fonctionnement-du-site',
    component: ThisWebsiteComponent,
    data: {
      title: "Fonctionnement du site | Le Repaire de l'Étalon",
      meta: [
        {
          name: 'description',
          content: `Obtenez des informations concernant Le Repaire de l'Étalon, une plateforme d'achat et de vente de saillies dans la filière équine, 
telles que les fonctionnalités du site, les tarifs d'utilisation, les types de saillies disponibles, des détails sur le contrat de saillie.`
        },
        {
          name: 'author',
          content: 'Alexandre Venot'
        }
      ]
    }

  },
  {
    path: 'contact',
    component: ContactComponent,
    data: {
      title: "Contact | Le Repaire de l'Étalon",
      meta: [
        {
          name: 'description',
          content: "Trouvez un moyen de nous contacter, par exemple pour poser une question ou bien obtenir de l'aide dans l'utilisation de la plateforme."
        }
      ]
    }
  },
  {path: '**', redirectTo: '/rechercher-un-etalon', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
