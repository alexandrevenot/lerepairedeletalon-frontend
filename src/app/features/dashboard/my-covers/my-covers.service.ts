import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { backendBaseUrl } from 'src/environments/environment';

export interface coverItem {
    id: string;
    stallion_name: string;
    mare_name: string;
    status: string;
    price: number;
    pov: string;
}

export interface coversData {
    items: Array<coverItem>
}

@Injectable()
export class MyCoversService {
    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        return throwError(() => new Error());
      }

    getCovers(group: string, pov: string) {
        let params = new HttpParams()
        .set('group', group)
        .set('point_of_view', pov)

        return this.http.get<coversData>(
            `${backendBaseUrl}/covers/cover-group`,
            { params }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}