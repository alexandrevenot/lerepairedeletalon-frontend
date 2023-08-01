import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError, catchError } from 'rxjs';
import { getStallionPhoto } from '../../../../../environments/httpCommonMethods'

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
    public getStallionPhoto = getStallionPhoto;

    constructor(private http: HttpClient) { }

    handleError(error: HttpErrorResponse) {
        return throwError(() => new Error());
    }

    getStallionsList() {
        return this.http.get<getStallionsListArray>(
            "http://localhost:3001/stallions/get-my-stallions"
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    getProfilePicture(photoId: string) {
        return this.getStallionPhoto(this.http, photoId)
    }
}