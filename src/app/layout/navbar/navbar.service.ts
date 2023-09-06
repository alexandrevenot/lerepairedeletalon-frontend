import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

export interface returnUser {
    firstname: string;
    lastname: string;
}

@Injectable()
export class NavbarService {
    constructor(private http: HttpClient) {}

    getUser() {
        return this.http.get<returnUser>(
            'http://localhost:3001/auth/user-name'
        ).pipe(
            catchError(() => {
                return of<returnUser>({firstname: "", lastname: ""});
            })
        )
    }    
}