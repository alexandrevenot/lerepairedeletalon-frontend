import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { updateFilterData } from '../filters/filters.component'

export interface searchItem {
    id: string;
    name: string;
    breed: string;
    height: number;
    cover_types: Array<number>;
    city: string;
    dep_name: string;
    reg_name: string;
    price: number;
    photo_url: string;
  }

export interface searchData {
    content: Array<searchItem>
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

    let productionBreeds: string[] = [];
    for (const productionBreed in filters.productionBreeds) {
      if (filters.productionBreeds[productionBreed]) {
        productionBreeds.push(productionBreed);
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

    for (const productionBreed of productionBreeds) {
      params = params.append('production_breeds', productionBreed)
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

    if (typeof filters.form['lowestHeight'] === "string" && filters.form['lowestHeight'].length > 0) {
      params = params.append('min_height', filters.form['lowestHeight'])
    }

    if (typeof filters.form['highestHeight'] === "string" && filters.form['highestHeight'].length > 0) {
      params = params.append('max_height', filters.form['highestHeight'])
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
}