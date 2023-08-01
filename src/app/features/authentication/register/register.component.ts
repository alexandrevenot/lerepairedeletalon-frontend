import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterService } from './register.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [RegisterService]
})

export class RegisterComponent {

  registerForm = new FormGroup({
    firstname: new FormControl('', Validators.required),
    lastname: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    phoneNumber: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  message = new FormControl('');
  buttonIsClicked = {status: false};

  constructor(
    private registerService: RegisterService,
    private router: Router
    ) {}

  sendRegisterData() {
    return this.registerService.postRegister(
      this.registerForm.value.firstname,
      this.registerForm.value.lastname,
      this.registerForm.value.email,
      this.registerForm.value.phoneNumber,
      this.registerForm.value.password,
      this.message,
      this.buttonIsClicked)
  }

  onSubmit() {
    this.buttonIsClicked.status = true;
    this.sendRegisterData()
    .subscribe(() => {
      this.buttonIsClicked.status = false;
      this.message.setValue('Compte créé avec succès.');
      this.router.navigate(['/login']);
    })
  }
}