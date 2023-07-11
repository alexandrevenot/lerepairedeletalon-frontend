import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { catchError, throwError } from "rxjs";

export interface getCityItem {
    city_name: string,
    postal_code: string,
    lat: number,
    lng: number
  }
  
export interface getCityData {
    content: Array<getCityItem>
}

@Injectable()
export class GeolocationService {
    constructor(private http: HttpClient) { }

    handleGetCityError(error: HttpErrorResponse, message: any) {
    if (error.status === 422) {
      if (error.error && error.error.detail && error.error.detail.value) {
        const value = error.error.detail.value;
        message.setValue("Il existe " + value.toString() + " code postaux valides pour cette entrée. Veuillez ajouter au moins les premiers chiffres du code postal.");
      }
    } else {
        message.setValue("Veuillez vérifier l'orthographe de la ville ou en essayer une plus grande.");
    }
    return throwError(() => new Error());
  }

    getCity(
    input: string,
    success: {[key: string]: boolean},
    locationMessage: FormControl<any>) {
    let params = new HttpParams()
    .set('user_input', input);

    return this.http.get<getCityData>(
      "http://localhost:3001/geoloc/get-city",
      { params }
    ).pipe(
        catchError((error: HttpErrorResponse) => {
            success['status'] = false;
            return this.handleGetCityError(error, locationMessage);
        })
      );
  }
}