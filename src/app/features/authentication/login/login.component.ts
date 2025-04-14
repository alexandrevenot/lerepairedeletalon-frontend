import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from './login.service';
import { loginData } from './login.service';
import { NavbarService } from 'src/app/layout/navbar/navbar.service';
import { backendInteractionStatus } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from 'src/app/core/seo/seo.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [
    LoginService
  ]
})
export class LoginComponent implements OnInit {
  public loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  public message = new FormControl('');
  public status: Record<string, backendInteractionStatus> = {status: backendInteractionStatus.Init};

  modalIsActive: boolean = false;
  passwordRecoveryEmailFC: FormControl = new FormControl('');
  passwordRecoveryHelperFC: FormControl = new FormControl('');
  passwordRecoveryStatus: Record<string, backendInteractionStatus> = {status: backendInteractionStatus.Init};

  constructor(
    private loginService: LoginService,
    private navbarService: NavbarService,
    private router: Router,
    private route: ActivatedRoute,
    private seoService: SeoService
  ) {}

ngOnInit(): void {
  const seoData = this.route.snapshot.data;
  this.seoService.initSeo(seoData);
}

  navigateToRegister() {
    this.router.navigate(['/inscription']);
  }

  triggerModal() {
    this.passwordRecoveryHelperFC.setValue('');
    const enteredEmail = this.loginForm.value.email;
    if (enteredEmail) {
      this.passwordRecoveryEmailFC.setValue(enteredEmail);
    }
    this.modalIsActive = true;
  }

  closeModal() {
    this.modalIsActive = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  recoverPassword() {
    this.passwordRecoveryStatus['status'] = backendInteractionStatus.Loading;
    const email = this.passwordRecoveryEmailFC.getRawValue();
    if (!email) {
      this.passwordRecoveryStatus['status'] = backendInteractionStatus.UserError;
      this.passwordRecoveryHelperFC.setValue('Vous devez indiquer votre email dans le champ ci-dessus.')
      return
    }

    this.loginService.recoverPassword(email, this.passwordRecoveryHelperFC, this.passwordRecoveryStatus)
    .subscribe({
      next: () => {
        this.passwordRecoveryStatus['status'] = backendInteractionStatus.Success;
        this.message.setValue('Email de récupération envoyé avec succès.');
        this.status['status'] = backendInteractionStatus.Success;
        this.closeModal();
      },
      error: () => {}
    })
  }

  onSubmit() {
    if (!this.loginForm.valid) {
      this.status['status'] = backendInteractionStatus.UserError;
      this.message.setValue("Vous devez indiquer un email, et un mot de passe.");
      return
    }

    this.message.setValue('');
    this.status['status'] = backendInteractionStatus.Loading;
    return this.loginService.postLogin(
      this.loginForm.getRawValue(),
      this.message,
      this.status
    )
    .subscribe({
      next: (data: loginData) => {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        this.message.setValue('Connexion réussie.');
        this.status['status'] = backendInteractionStatus.Success;
        this.navbarService.loadNavbar();
        setTimeout(() => {
          this.router.navigate(['/rechercher-un-etalon']);
        }, 1000);
      },
      error: () => {},
    })
  }
}