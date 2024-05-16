import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { backendBaseUrl } from 'src/environments/environment';

@Injectable()
export class DashboardStallionBoxService {
    constructor(private http: HttpClient) { }

    handleError(error: HttpErrorResponse) {
        return throwError(() => new Error());
    }

    deleteStallion(stallionId: string) {
        return this.http.delete(
            `${backendBaseUrl}/stallions/stallion/${stallionId}`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    changeStallionProfileStatus(stallionId: string, newStatus: string) {
        const params = new HttpParams()
        .set('new_status', newStatus);

        return this.http.put(
            `${backendBaseUrl}/stallions/stallion-profile-status/${stallionId}`,
            {},
            {params}
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}