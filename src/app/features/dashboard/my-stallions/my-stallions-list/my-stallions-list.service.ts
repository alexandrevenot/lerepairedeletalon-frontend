import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError, catchError } from 'rxjs';
import { backendBaseUrl } from 'src/environments/environment';

interface getStallionsListItem {
    id: string;
    name: string;
    breed: string;
    photo_url: string;
    last_update_timestamp: string;
    profile_status: string;
}

export interface getStallionsListArray {
    content: Array<getStallionsListItem>
}

@Injectable()
export class MyStallionsListService {
    constructor(private http: HttpClient) { }

    handleError(error: HttpErrorResponse) {
        return throwError(() => new Error());
    }

    getStallionsList() {
        return this.http.get<getStallionsListArray>(
            `${backendBaseUrl}/stallions/my-stallions`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}