import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { FormControl } from '@angular/forms';

export const backToFrontNames: Record<string, string> = {
    gender: 'gender',
    firstname: 'firstname',
    lastname: 'lastname',
    postal_address: 'postalAddress',
    birthdate: 'birthdate',
    birthplace: 'birthplace',
    citizenship: 'citizenship',
    // company
    company_name: 'companyName',
    company_status: 'companyStatus',
    capital: 'capital',
    head_office_address: 'headOfficeAddress',
    siret: 'siret',
};

export interface ProfileInformation {
    type: string
    gender: string
    firstname: string
    lastname: string
    postal_address: string
    birthdate: string
    birthplace: string
    citizenship: string
    // company
    company_name: string
    company_status: string
    capital: number
    head_office_address: string
    siret: string
}

@Injectable()
export class ProfileInformationService {
    constructor(private http: HttpClient) {}

    handleGetProfileInfoError(error: HttpErrorResponse, exists: Record<string, boolean>) {
        if (error.status === 404) {
            exists['status'] = false;
        }
        return throwError(() => new Error());
    }

    handleSaveProfileInfoError(messageFormControl: FormControl) {
        messageFormControl.setValue('Une erreur est survenue. Merci de réessayer.');

        return throwError(() => new Error());
    }

    getProfileInformation(exists: Record<string, boolean>){
        return this.http.get<ProfileInformation>(
            "http://localhost:3001/auth/contracts-identity"
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleGetProfileInfoError(error, exists);
            })
        )
    }

    updateProfileInformation(
        type: string,
        form: Record<string, string>,
        backendErrorStatus: Record<string, boolean>,
        messageFormControl: FormControl,
        buttonIsLoading: Record<string, boolean>
        ) {

        let body: Record<string, string> = {}

        // for each type
        for (let key of ['gender', 'postal_address', 'birthdate', 'birthplace', 'citizenship' ]) {
            body[key] = form[backToFrontNames[key]]
        }

        // only if company
        if (type == 'company') {
            for (let key of ['company_name', 'company_status', 'capital', 'head_office_address', 'siret']) {
                body[key] = form[backToFrontNames[key]]
            }
            body["type"] = "company";
        } else {
            body["type"] = "individual";
        }

        return this.http.put(
            "http://localhost:3001/auth/profile-information",
            body
        ).pipe(
            catchError(() => {
                backendErrorStatus['status'] = true;
                buttonIsLoading['status'] = false;
                return this.handleSaveProfileInfoError(messageFormControl);
            })
        )
    }
}