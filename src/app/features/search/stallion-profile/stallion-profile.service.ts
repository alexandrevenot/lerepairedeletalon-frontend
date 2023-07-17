import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

interface stallionProfile {
    name: string;
    breed: string;
    n_sire: string;
    birthdate: string;
    color: string;
    stallion_additional_info: string;
    height: number;
    main_desc: string;
    nSIRE: string;
    offspring: string;
    pedigree: string;
    pedigree_po: string;
    performance: string;
    photos: Array<string>;
    price: number;
    city: string;
    dep_name: string;
    reg_name: string;
    cover_additional_info: string;
    prices: Array<Record<string, any>>;
}

export interface returnedStallion {
    stallionProfile: stallionProfile
}

@Injectable()
export class StallionProfileService {
    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        console.log(error);
        return throwError(() => new Error());
    }
    
    getStallionProfile(stallionId: string) {
        let params = new HttpParams()
        .set('id', stallionId)

        return this.http.get<returnedStallion>(
            "http://localhost:3001/stallions/get-stallion-profile-information",
            { params }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    getPicture(photoId: string) {
        let params = new HttpParams()
        .set('id', photoId)

        return this.http.get(
            "http://localhost:3001/stallions/get-stallion-photo",
            {params, responseType: 'blob'}
          ).pipe(
            catchError((error: HttpErrorResponse) => {
              return this.handleError(error);
          })
          )
    }

    sendDemandToVendor() {
        
    }
}