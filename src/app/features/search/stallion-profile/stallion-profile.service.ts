import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { FormControl } from '@angular/forms';

interface CoverSpecs {
    cover_type: string;
    cover_place: string;
    price: number;
}

interface stallionProfile {
    owner: string;
    name: string;
    breed: string;
    n_sire: string;
    photos: Array<string>;
    main_desc: string;
    color: string;
    age: number;
    height: number;
    offspring: string;
    performance: string;
    pedigree: Array<string>;
    pedigree_po: string;
    stallion_additional_info: string;
    prices: Array<CoverSpecs>
    production_breeds: Array<string>;
    cover_additional_info: string;
    city: string;
    postal_code: string;
    dep_name: string;
    reg_name: string;
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
        .set('stallion_id', stallionId)

        return this.http.get<returnedStallion>(
            "http://localhost:3001/stallions/stallion-profile-information",
            { params }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    getPicture(photoId: string) {
        let params = new HttpParams()
        .set('photo_id', photoId)

        return this.http.get(
            "http://localhost:3001/stallions/stallion-photo",
            {params, responseType: 'blob'}
          ).pipe(
            catchError((error: HttpErrorResponse) => {
              return this.handleError(error);
          })
          )
    }

    handleCreateCoverError(error: HttpErrorResponse, messageFormControl: FormControl) {
        if (error.status === 400) {
            if (error.error && error.error.detail) {
                if (error.error.detail == "seller_id is equal to buyer_id") {
                    messageFormControl.setValue("Bien que nous serions ravis d'en récupérer les frais de service, vous ne pouvez pas acheter de saillie à vous-même.")
                } else if (error.error.detail == "cover already exists") {
                    messageFormControl.setValue("Cette saillie a déjà été demandée, ou bien est déjà en cours.")
                }
            }
        } else if (error.status === 500) {
            messageFormControl.setValue('Une erreur est survenue. Merci de réessayer.');
        }
        return throwError(() => new Error());
    }

    sendDemandToVendor(
        form: Record<string, string>,
        owner: string,
        nSire: string,
        backendErrorStatus: Record<string, boolean>,
        messageFormControl: FormControl,
        buttonIsLoading: Record<string, boolean>
        ) {
        const body: Record<string, string> = {
            seller_id: owner,
            stallion_nsire: nSire,
            mare_nsire: form['mareNSIRE'],
            mare_name: form['mareName'],
            mare_breed: form['mareBreed'],
            cover_type: form['selectedCoverType'],
            message: form['messageToVendor'],
            offered_cover_place: form['offeredCoverPlace']
        }

        return this.http.post(
            "http://localhost:3001/covers/create-cover",
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                backendErrorStatus['status'] = true;
                buttonIsLoading['status'] = false;
                return this.handleCreateCoverError(error, messageFormControl);
            })
        )
    }
}