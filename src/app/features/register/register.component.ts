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

  constructor(
    private registerService: RegisterService,
    private router: Router
    ) {}


  registerForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  message = new FormControl('');
  buttonIsClicked = {status: false};

  sendRegisterData() {
    let email = this.registerForm.value.email;
    let password = this.registerForm.value.password;
    return this.registerService.postRegister(email, password, this.message, this.buttonIsClicked)
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