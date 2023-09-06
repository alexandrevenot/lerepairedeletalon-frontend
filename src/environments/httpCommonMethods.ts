import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export function getStallionPhoto(httpClient: HttpClient, photoId: string) {
    let params = new HttpParams()
    .set('photo_id', photoId);
  
    return httpClient.get(
      "http://localhost:3001/stallions/stallion-photo",
      {params, responseType: 'blob'}
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error());
    })
    )  
  }