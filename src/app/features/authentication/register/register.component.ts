import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterService } from './register.service';
import { Router } from "@angular/router";
import { backendInteractionStatus } from 'src/environments/environment';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [RegisterService]
})

export class RegisterComponent {
  public registerForm = new FormGroup({
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    phoneNumber: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  public message = new FormControl('');
  public status: Record<string, backendInteractionStatus> = {status: backendInteractionStatus.Init};

  constructor(
    private registerService: RegisterService,
    private router: Router
  ) {}

  parsePhoneNumber() {
    let value = this.registerForm.value.phoneNumber;
    if (value) {
      value = value.replace(/\D/g, '').slice(0, 10);
      this.registerForm.get('phoneNumber')?.setValue(value.replace(/(.{2})/g, '$1 ').trim());
    }
  }

  onSubmit() {
    if (!this.registerForm.valid) {
      this.message.setValue('Vous devez compléter tous les champs.')
      this.status['status'] = backendInteractionStatus.UserError;
      return
    }

    const phoneNumberValue = this.registerForm.value.phoneNumber?.replace(/\s/g, '');
    if (!phoneNumberValue || ! /^\d{10}$/.test(phoneNumberValue)) {
      this.message.setValue('Le numéro de téléphone portable est incomplet.')
      this.status['status'] = backendInteractionStatus.UserError;
      return
    }

    const emailValue = this.registerForm.value.email;
    if (!emailValue || ! /^[\w\.-]+@[\w\.-]+\.\w+$/.test(emailValue)) {
      this.message.setValue("Le format de l'adresse mail est incorrect.")
      this.status['status'] = backendInteractionStatus.UserError;
      return
    }

    this.status['status'] = backendInteractionStatus.Loading;
    this.registerService.postRegister(
      this.registerForm.getRawValue(),
      this.message,
      this.status
    )
    .subscribe({
      next: () => {
        this.message.setValue('Compte créé avec succès.');
        setTimeout(() => {this.router.navigate(['/login'])}, 2000);
      },
      error: () => {}
    })
  }
}