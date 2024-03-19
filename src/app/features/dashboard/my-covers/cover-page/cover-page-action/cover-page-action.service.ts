import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { backendBaseUrl } from "src/environments/environment";

export interface GetSignUrl {
    url: string;
}

export interface GetCheckout {
    client_secret: string;
}

@Injectable()
export class CoverPageActionService {

    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        return throwError(() => new Error());
    }

    getSignUrl(coverId: string) {
        return this.http.get<GetSignUrl>(
            `${backendBaseUrl}/contracts/sign-page-url/${coverId}`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    getCheckout(coverId: string) {
        return this.http.get<GetCheckout>(
            `${backendBaseUrl}/payments/create-checkout-session/${coverId}`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    stepForwardPayment(coverId: string) {
        return this.http.post(
            `${backendBaseUrl}/covers/step-forward-payment/${coverId}`,
            {}
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}