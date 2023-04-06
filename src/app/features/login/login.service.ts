import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface loginData {
    accessToken: string;
    refreshToken: string;
  }

@Injectable()
export class LoginService {
  constructor(private http: HttpClient) { }

  handleError(error: HttpErrorResponse, message: any) {
    if (error.status === 404 || error.status === 401) {
        message.setValue("Les informations fournies n'ont pas permis de vous identifier.");
    } else {
        message.setValue('Une erreur est survenue. Merci de réessayer.');
    }
    return throwError(() => new Error());
  }

  postLogin(email: any, password: any, message: any, buttonIsClicked: any) {
    return this.http.post<loginData>(
      "http://localhost:3001/auth/login",
      {email: email, password: password}
      ).pipe(
        catchError((error: HttpErrorResponse) => {
            buttonIsClicked.status = false; 
            return this.handleError(error, message);
        })
      );
  }

}