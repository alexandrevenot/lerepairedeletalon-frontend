import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";

export interface FavoriteStallionprofile {
    name: string;
    breed: string;
    thumbnail_photo: string;
    profile_status: string;
}

@Injectable()
export class FavoriteStallionBoxService {
    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        return throwError(() => new Error());
    }

    getStallionThumbnailProfite(stallionId: string) {
        const params = new HttpParams()
        .set('mode', 'for_favorite');

        return this.http.get<FavoriteStallionprofile>(
            `http://localhost:3001/stallions/stallion/${stallionId}`,
            {params}
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}