import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { FormControl } from '@angular/forms';
import {LIBandHANDSpecs, SingularStallionSTDSpecs } from '../../dashboard/my-stallions/stallion/stallion.service';
import { backendBaseUrl, backendInteractionStatus } from 'src/environments/environment';

export interface CoverSpecs {
    lib: LIBandHANDSpecs | null;
    hand: LIBandHANDSpecs | null;
}

export interface StallionProfile {
    handler_id: string;
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
    crossbreeding_advice: string;
    stallion_additional_info: string;
    cover_specs: CoverSpecs;
    production_breeds: Array<string>;
    cover_additional_info: string;
    city: string;
    postal_code: string;
    dep_name: string;
    reg_name: string;
    stallion_std_negative_tests: Record<string, SingularStallionSTDSpecs>;
    stallion_vaccines: Array<string>;
}

@Injectable()
export class StallionProfileService {
    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        return throwError(() => new Error());
    }
    
    getStallionProfile(stallionId: string) {
        const params = new HttpParams()
        .set('mode', 'profile');

        return this.http.get<StallionProfile>(
            `${backendBaseUrl}/stallions/stallion/${stallionId}`,
            {params}
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    sendDemandToSeller(
        form: Record<string, string>,
        stallionId: string,
        handlerId: string,
        nSire: string,
        demandStatus: Record<string, backendInteractionStatus>,
        messageFormControl: FormControl,
        ) {
        const body: Record<string, string> = {
            stallion_id: stallionId,
            seller_id: handlerId,
            stallion_nsire: nSire,
            mare_nsire: form['mareNSIRE'],
            mare_name: form['mareName'],
            mare_breed: form['mareBreed'],
            cover_type: form['selectedCoverType'],
            message: form['messageToSeller'],
            mare_pregnancy_history: form['marePregnancyHistory']
        }

        return this.http.post(
            `${backendBaseUrl}/covers/cover`,
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                demandStatus['status'] = backendInteractionStatus.BackendError;

                if (error.status === 400) {
                    if (error.error && error.error.detail) {
                        if (error.error.detail == "seller_id is equal to buyer_id") {
                            messageFormControl.setValue("Bien que nous serions ravis d'en récupérer les frais de service, vous ne pouvez pas acheter de saillie à vous-même.")
                        } else if (error.error.detail == "cover already exists") {
                            messageFormControl.setValue("Cette saillie a déjà été demandée, ou bien est déjà en cours.")
                        }
                    }
                } else {
                    messageFormControl.setValue("Une erreur est survenue. C'est peut-être de notre côté. Merci de réessayer.");
                }
                return throwError(() => new Error());
            })
        )
    }
}