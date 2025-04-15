import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from "@angular/router";
import { Observable, catchError, throwError } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { backendBaseUrl } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  public backendBaseUrl = backendBaseUrl;

  constructor(
    private authService: AuthService,
    private router: Router
    ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken("access");

    // If an access token is available in the local storage
    if (req.urlWithParams.includes(backendBaseUrl) && authToken != "") {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', authToken)
      });

      // Execute the request with the accessToken attached
      return next.handle(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err && err.status === 401 && err.error.detail === 'invalid token') {
            return this.authService.handle401InvalidToken(req, next)
          } else {
            return throwError(() => err);
          }
      }));
    } else { // If a protected route is trying to be accessed without a token in the local storage
      return next.handle(req).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err && err.status === 401 && err.error.detail === 'token not found in the request') {
            if (!req.url.includes('user-name') && !req.url.includes('favorites')) {
              this.router.navigate(['/connexion']);
            }
            return throwError(() => err);
          } else {
            return throwError(() => err);
          }
        })
      )
    }
  }
}