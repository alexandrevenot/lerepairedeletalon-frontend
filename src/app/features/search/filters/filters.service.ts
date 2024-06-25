import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { backendBaseUrl } from 'src/environments/environment';

export interface breeds {
  breeds: Array<string>;
}

@Injectable()
export class FiltersService {
  constructor(private http: HttpClient) { }

  handleError(error: HttpErrorResponse) {
    return throwError(() => new Error());
  }

  getAvailableBreeds(type: 'breeds' | 'production-breeds') {
    return this.http.get<breeds>(
      `${backendBaseUrl}/stallions/available-stallion-${type}`
  ).pipe(
      catchError((error: HttpErrorResponse) => {
          return this.handleError(error);
      })
  )
  }
}