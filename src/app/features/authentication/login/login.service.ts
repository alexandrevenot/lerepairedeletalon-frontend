import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { backendBaseUrl, backendInteractionStatus } from 'src/environments/environment';
import { FormControl } from '@angular/forms';

export interface loginData {
    accessToken: string;
    refreshToken: string;
  }

@Injectable()
export class LoginService {
  constructor(private http: HttpClient) { }

  handleError(error: HttpErrorResponse, message: any) {
    if (error.status === 404) {
      message.setValue("Aucun compte associé à cette adresse mail n'a été trouvé.");
    } else if (error.status === 401) {
      message.setValue("Le mot de passe entré est incorrect.");
    } else {
      message.setValue("Une erreur est survenue. C'est peut-être de notre côté. Merci de réessayer.");
    }
    return throwError(() => new Error());
  }

  postLogin(form: Record<string, string | boolean | null>, message: any, status: Record<string, backendInteractionStatus>) {
    const body = {
      "email": form["email"],
      "password": form["password"]
    }
    return this.http.post<loginData>(
      `${backendBaseUrl}/auth/login`,
      body
      ).pipe(
        catchError((error: HttpErrorResponse) => {
            status['status'] = backendInteractionStatus.BackendError; 
            return this.handleError(error, message);
        })
      );
  }

  recoverPassword(email: string, helper: FormControl, status: Record<string, backendInteractionStatus>) {
    return this.http.post(
      `${backendBaseUrl}/mailing/send-password-update-email`,
      { "email": email }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        status['status'] = backendInteractionStatus.BackendError;
        if (error.status == 404) {
          helper.setValue("Aucun compte associé à cette adresse mail n'a été trouvé.");
        } else {
          helper.setValue("Une erreur est survenue. C'est peut-être de notre côté. Merci de réessayer.");
        }

        return throwError(() => new Error());
      })
    )
  }
}