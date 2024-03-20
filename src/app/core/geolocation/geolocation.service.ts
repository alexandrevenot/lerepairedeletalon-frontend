import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { catchError, throwError } from "rxjs";
import { backendBaseUrl, backendInteractionStatus } from "src/environments/environment";

export interface getCityItem {
    city: string,
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
      if (error.status === 404) {
        message.setValue("Veuillez vérifier l'orthographe de la ville ou en essayer une plus grande.");
      } else {
        message.setValue("Une erreur est survenue. C'est peut-être de notre côté. Veuillez réessayer s'il vous plaît.");
      }
      return throwError(() => new Error());
    }

    getCity(
      city: string,
      status: Record<string,backendInteractionStatus>,
      message: FormControl<any>
    ) {
    let params = new HttpParams()
    .set('city', city);

    return this.http.get<getCityData>(
      `${backendBaseUrl}/geoloc/city`,
      { params }
    ).pipe(
        catchError((error: HttpErrorResponse) => {
            status['status'] = backendInteractionStatus.BackendError;
            return this.handleGetCityError(error, message)
        })
      );
  }
}