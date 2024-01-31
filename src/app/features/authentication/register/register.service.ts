import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { backendBaseUrl, backendInteractionStatus } from 'src/environments/environment';

@Injectable()
export class RegisterService {
  constructor(private http: HttpClient) { }

  handleError(error: HttpErrorResponse, message: any) {
    if (error.status === 400) {
        message.setValue('Un compte existe déjà avec cette adresse mail.');
    } else {
        message.setValue("Une erreur est survenue. C'est peut-être de notre côté. Merci de réessayer.");
    }
    return throwError(() => new Error());
  }

  postRegister(form: Record<string, string | null>, message: FormControl, status: Record<string, backendInteractionStatus>) {
    const body = {
      "firstname": form["firstname"],
      "lastname": form["lastname"],
      "email": form["email"],
      "phone_number": form["phoneNumber"]?.replace(/\s/g, ''),
      "password": form["password"]
    }
    return this.http.post(
      `${backendBaseUrl}/auth/register`,
      body
      ).pipe(
        catchError((error: HttpErrorResponse) => {
          status['status'] = backendInteractionStatus.BackendError; 
            return this.handleError(error, message);
        })
      );
  }

}