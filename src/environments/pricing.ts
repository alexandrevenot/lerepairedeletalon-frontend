import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";

export interface checkoutResponse {
    subtotal: number,
    service_fees_ht: number,
    service_fees_taxes: number,
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
        "http://localhost:3001/pricing/get-checkout",
        { params }
      ).pipe(
          catchError((error: HttpErrorResponse) => {
              return this.handleError(error);
          })
      );
    }
}