import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { backendBaseUrl } from 'src/environments/environment';

export interface FavoriteStallions {
    favorite_stallions: Array<string>
}

@Injectable({
    providedIn: 'root',
})
export class FavoriteStallionsService {
    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        return throwError(() => new Error());
      }

    getFavorites() {
        return this.http.get<FavoriteStallions>(
            `${backendBaseUrl}/stallions/favorites`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    addToFavorites(stallionId: string) {
        return this.http.post(
            `${backendBaseUrl}/stallions/favorites/${stallionId}`,
            {}
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    removeFromFavorites(stallionId: string) {
        return this.http.delete(
            `${backendBaseUrl}/stallions/favorites/${stallionId}`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}