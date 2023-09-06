import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";

export interface GetSignUrl {
    url: string;
}

export interface GetCheckout {
    subtotal: number;
    service_fees: number;
    total: number;
    status: string;
}

@Injectable()
export class CoverPageActionService {
    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        console.log(error);
        return throwError(() => new Error());
    }

    getSignUrl(coverId: string) {
        let params = new HttpParams()
        .set('cover_id', coverId);

        return this.http.get<GetSignUrl>(
            "http://localhost:3001/contracts/sign-page-url",
            { params }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    getCheckout(coverId: string) {
        let params = new HttpParams()
        .set('cover_id', coverId);

        return this.http.get<GetCheckout>(
            "http://localhost:3001/covers/checkout",
            { params }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    stepForwardPayment(coverId: string) {
        const body: Record<string, string> = {
            cover_id: coverId
        }

        return this.http.post(
            "http://localhost:3001/covers/step-forward-payment",
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}