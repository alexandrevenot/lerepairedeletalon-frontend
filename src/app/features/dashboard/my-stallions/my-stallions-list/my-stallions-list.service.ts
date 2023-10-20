import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError, catchError } from 'rxjs';

interface getStallionsListItem {
    id: string;
    name: string;
    breed: string;
    photoId: string;
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
            "http://localhost:3001/stallions/my-stallions"
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}