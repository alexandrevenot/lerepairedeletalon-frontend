import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class PhotosService {
    constructor(private http: HttpClient) { }

    handleError(error: HttpErrorResponse) {
      return throwError(() => new Error());
    }

    getPhoto(id: string) {
      return this.http.get(
        `http://localhost:3001/stallions/stallion-photo/${id}`,
        {responseType: 'blob'}
      ).pipe(
        catchError((error: HttpErrorResponse) => {
          return this.handleError(error);
        })
      )
    }
}