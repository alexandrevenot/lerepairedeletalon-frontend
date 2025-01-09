import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { backendBaseUrl } from "src/environments/environment";

export interface checkoutResponse {
    subtotal: number,
    fees: number,
    total: number
}

@Injectable()
export class PricingService {
    constructor(private http: HttpClient) { }

    handleError(error: HttpErrorResponse) {
      return throwError(() => new Error());
    }

    getCheckout(price: number) {
      let params = new HttpParams()
      .set('subtotal', price);

      return this.http.get<checkoutResponse>(
        `${backendBaseUrl}/payments/checkout-simulation`,
        { params }
      ).pipe(
          catchError((error: HttpErrorResponse) => {
              return this.handleError(error);
          })
      );
    }
}