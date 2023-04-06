import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoginService } from './login.service';
import { loginData } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [LoginService]
})
export class LoginComponent {

  constructor(
    private loginService: LoginService
    ) {}
  
  loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  message = new FormControl('');
  buttonIsClicked = {status: false};

  sendLoginData() {
    let email = this.loginForm.value.email;
    let password = this.loginForm.value.password;
    return this.loginService.postLogin(email, password, this.message, this.buttonIsClicked)
  }

  onSubmit() {
    this.buttonIsClicked.status = true;
    this.sendLoginData()
    .subscribe((data: loginData) => {
      this.buttonIsClicked.status = false;
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      this.message.setValue('Connexion réussie.');
    })
  }
}