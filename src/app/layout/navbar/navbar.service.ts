import { Injectable, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';

interface returnUser {
    firstname: string;
    lastname: string;
}

export interface connectionStatus {
    firstname: string;
    lastname: string;
    userIsLoggedIn: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class NavbarService {
    @Output() loadNavbarEvent = new EventEmitter<connectionStatus>();
    
    constructor(private http: HttpClient) {}

    public getUser() {
        return this.http.get<returnUser>(
            'http://localhost:3001/users/user-name'
        ).pipe(
            catchError(() => {
                return of<returnUser>({firstname: "", lastname: ""});
            })
        )
    }

    loadNavbar() {
        this.getUser()
        .subscribe((data: returnUser) => {
            this.loadNavbarEvent.emit({
                firstname: data.firstname,
                lastname: data.lastname,
                userIsLoggedIn: data.firstname && data.lastname? true : false
            })
          })
    }
}