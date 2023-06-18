import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

interface stallionProfile {
    name: string;
    breed: string;
    birthdate: string;
    c_saillies: string;
    color: string;
    comments: string;
    height: number;
    location: string;
    main_desc: string;
    nSIRE: string;
    offspring: string;
    pedigree: string;
    pedigree_po: string;
    performance: string;
    photos: Array<string>;
    price: number;
    r_types: {[key: string]: boolean};
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