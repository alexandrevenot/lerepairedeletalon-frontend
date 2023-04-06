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

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private router: Router
    ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken("access");

    // If an access token is available in the local storage
    if (authToken != "") {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', authToken)
      });

      // Execute the request with the accessToken attached
      return next.handle(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err && err.status === 401 && err.error.message === 'invalid token') {
            return this.authService.handle401InvalidToken(req, next)
          } else {
            return throwError(() => err);
          }
      }));
    } else {
      return next.handle(req);
    }
  }
}