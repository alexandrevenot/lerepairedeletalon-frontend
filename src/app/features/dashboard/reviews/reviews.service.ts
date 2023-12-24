import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";

export interface Review {
    stallion_name: string;
    stallion_nsire: string;
    reviewed_firstname: string;
    reviewed_lastname: string;
    reviewer_firstname: string;
    reviewer_lastname: string;
    content: string;
    score: number;
    writing_date: string;
}

export interface Reviews {
    reviews: Array<Review>
}

@Injectable()
export class ReviewsService {
    constructor(
        private http: HttpClient
    ) {}

    getReviews(
        userId: string,
        reviewPov: string,
        coverPov: string
    ) {
        const params = new HttpParams()
        .set('review_pov', reviewPov)
        .set('cover_pov', coverPov);

        return this.http.get<Reviews>(
            `http://localhost:3001/users/reviews/${userId}`,
            { params }
        ).pipe(
            catchError(() => {
                return throwError(() => new Error());
            })
        )
    }
}