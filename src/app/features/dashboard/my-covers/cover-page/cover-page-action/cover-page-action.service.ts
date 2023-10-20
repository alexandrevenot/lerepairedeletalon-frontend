import { HttpClient, HttpErrorResponse } from "@angular/common/http";
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
        return this.http.get<GetSignUrl>(
            `http://localhost:3001/contracts/sign-page-url/${coverId}`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    getCheckout(coverId: string) {
        return this.http.get<GetCheckout>(
            `http://localhost:3001/pricing/checkout/${coverId}`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    stepForwardPayment(coverId: string) {
        return this.http.post(
            `http://localhost:3001/covers/step-forward-payment/${coverId}`,
            {}
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}