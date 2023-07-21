import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class RegisterService {
  constructor(private http: HttpClient) { }

  handleError(error: HttpErrorResponse, message: any) {
    if (error.status === 400) {
        message.setValue('Un compte existe déjà avec cette adresse mail.');
    } else {
        message.setValue('Une erreur est survenue. Merci de réessayer.');
    }
    return throwError(() => new Error());
  }

  postRegister(firstname: any, lastname: any, email: any, phoneNumber: any, password: any, message: any, buttonIsClicked: any) {
    return this.http.post(
      "http://localhost:3001/auth/register",
      {firstname: firstname, lastname: lastname, email: email, phone_number: phoneNumber, password: password}
      ).pipe(
        catchError((error: HttpErrorResponse) => {
            buttonIsClicked.status = false; 
            return this.handleError(error, message);
        })
      );
  }

}