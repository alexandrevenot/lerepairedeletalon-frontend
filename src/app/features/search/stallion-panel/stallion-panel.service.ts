import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { updateFilterData } from '../filters/filters.component'

interface returnedItem {
    id: string;
    name: string;
    location: string;
    price: number;
    photoId: string;
  }

export interface searchData {
    content: Array<returnedItem>
}

@Injectable()
export class StallionPanelService {
  constructor(private http: HttpClient) { }

  handleError(error: HttpErrorResponse) {
    console.log(error);
    return throwError(() => new Error());
  }

  getSearch(limit: number, page: number, filters: updateFilterData) {
    // filters parsing
    let breeds: string[] = [];
    for (const breed in filters.breeds) {
      if (filters.breeds[breed]) {
        breeds.push(breed);
      }
    }

    let colors: string[] = [];
    for (const color in filters.colors) {
      if (filters.colors[color]) {
        colors.push(color);
      }
    }

    // params creation
    let params = new HttpParams()
    .set('limit', limit)
    .set('page', page)

    for (const breed of breeds) {
      params = params.append('breeds', breed)
    }
    for (const color of colors) {
      params = params.append('colors', color)
    }

    if (typeof filters.form['lowest_price'] === "string" && filters.form['lowest_price'].length > 0) {
      params = params.append('min_price', filters.form['lowest_price'])
    }

    if (typeof filters.form['highest_price'] === "string" && filters.form['highest_price'].length > 0) {
      params = params.append('max_price', filters.form['highest_price'])
    }
    
    return this.http.get<searchData>(
        "http://localhost:3001/stallions/search",
        { params }
    ).pipe(
        catchError((error: HttpErrorResponse) => {
            return this.handleError(error);
        })
    )
  }

  getProfilePicture(photoId: string) {
    let params = new HttpParams()
    .set('id', photoId);

    return this.http.get(
      "http://localhost:3001/stallions/get-stallion-photo",
      {params, responseType: 'blob'}
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleError(error);
    })
    )
  }
}