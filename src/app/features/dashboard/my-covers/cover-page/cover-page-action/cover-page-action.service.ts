import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { backendBaseUrl } from "src/environments/environment";

export interface GetCheckout {
    client_secret: string;
}

@Injectable()
export class CoverPageActionService {

    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        return throwError(() => new Error());
    }

    getCheckout(coverId: string, paymentPart: string) {
        const params: HttpParams = new HttpParams()
        .set('payment_part', paymentPart);

        return this.http.get<GetCheckout>(
            `${backendBaseUrl}/payments/get-checkout-session/${coverId}`,
            { params }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}