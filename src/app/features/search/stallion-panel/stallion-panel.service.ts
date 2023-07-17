import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { updateFilterData } from '../filters/filters.component'
import { getStallionPhoto } from '../../../../environments/httpCommonMethods'

interface returnedItem {
    id: string;
    name: string;
    breed: string;
    city: string;
    dep_name: string;
    reg_name: string;
    price: number;
    photo_id: string;
  }

export interface searchData {
    content: Array<returnedItem>
}

@Injectable()
export class StallionPanelService {
  public getStallionPhoto = getStallionPhoto;

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

    let coverTypes: string[] = [];
    for (const coverType in filters.coverTypes) {
      if (filters.coverTypes[coverType]) {
        coverTypes.push(coverType);
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

    for (const coverType of coverTypes) {
      params = params.append('cover_types', coverType)
    }

    if (typeof filters.form['lowestPrice'] === "string" && filters.form['lowestPrice'].length > 0) {
      params = params.append('min_price', filters.form['lowestPrice'])
    }

    if (typeof filters.form['highestPrice'] === "string" && filters.form['highestPrice'].length > 0) {
      params = params.append('max_price', filters.form['highestPrice'])
    }
    
    if (filters.distance.max > 0) {
      params = params.append('distance', filters.distance.max);
      params = params.append('lat', filters.distance.lat);
      params = params.append('lng', filters.distance.lng);
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
    return this.getStallionPhoto(this.http, photoId)
  }
}