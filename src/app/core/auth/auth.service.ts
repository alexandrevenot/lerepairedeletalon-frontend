import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpRequest, HttpHandler } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { backendBaseUrl } from 'src/environments/environment';

export interface refreshData {
    accessToken: string;
    refreshToken: string;
  }

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        private http: HttpClient,
        private router: Router
    ) { }

    getToken(type: string) {
        let value: string | null = localStorage.getItem(`${type}Token`);
        if (value === null) {
            return "";
        } else {
            return `Bearer ${value}`;
        }
    }

    setToken(type: string, value: string) {
        localStorage.setItem(`${type}Token`, value);
    }

    handle401InvalidToken(req: HttpRequest<any>, next: HttpHandler) {
        return this.http.post<refreshData>(
            `${backendBaseUrl}/auth/refresh-token`,
            {
                token: this.getToken("refresh")
            }
        ).pipe(
            switchMap((data: refreshData) => {
                this.setToken("access", data.accessToken);
                this.setToken("refresh", data.refreshToken);
                // Attach the new accessToken and try again
                const newAuthReq = req.clone({
                  headers: req.headers.set('Authorization', this.getToken("access"))
                });
                return next.handle(newAuthReq);
              }),
            catchError((err: HttpErrorResponse) => {
                return throwError(() => err);
            })
        )
    }

    disconnectUser() {
        localStorage.clear();
        this.router.navigate(['/connexion']);
    }

    userIsLogged() {
        const token: string = this.getToken("access")
        if (token) {
            return true;
        } else {
            return false;
        }
    }
}