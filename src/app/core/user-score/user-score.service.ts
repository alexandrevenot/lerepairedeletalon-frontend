import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { backendBaseUrl } from "src/environments/environment";

export interface UserScore {
    firstname: string;
    lastname: string;
    score: number;
    nb_reviews: number;
    owner_has_other_reviews: boolean;
}

@Injectable({"providedIn": "root"})
export class UserScoreService {
    constructor(private http: HttpClient) {}

    getUserScore(userId: string, stallionNSIRE: string | null, coverPov: "buyer" | "seller") {
        let params = new HttpParams()
        .set('cover_pov', coverPov);

        if (stallionNSIRE) {
            params = params.set('stallion_nsire', stallionNSIRE);
        }

        return this.http.get<UserScore>(
            `${backendBaseUrl}/users/user-score/${userId}`,
            { params }
        ).pipe(
            catchError(() => {
                return throwError(() => new Error());
            })
        )
    }
}