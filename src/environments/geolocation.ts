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
      message.setValue("Veuillez vérifier l'orthographe de la ville / du code postal ou en essayer une plus grande.");

      return throwError(() => new Error());
    }

    getCity(
    city: string,
    postalCode: string,
    success: {[key: string]: boolean},
    locationMessage: FormControl<any>) {
    let params = new HttpParams()
    .set('city', city);

    if (postalCode != "") {
      params = params.set('requested_postal_code', postalCode);
    }

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