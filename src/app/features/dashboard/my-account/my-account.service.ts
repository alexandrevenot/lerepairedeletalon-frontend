import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { FormControl } from '@angular/forms';
import { backendInteractionStatus } from 'src/environments/environment';

@Injectable()
export class MyAccountService {
    constructor(private http: HttpClient) {}

    handleError() {
        return throwError(() => new Error());
    }

    sendPasswordUpdateEmail(email: string, passwordChangeStatus: Record<string, backendInteractionStatus>) {
        const body = {
            "email": email
        }
        passwordChangeStatus["status"] = backendInteractionStatus.Loading;
        return this.http.post(
            "http://localhost:3001/mailing/send-password-update-email",
            body
        ).pipe(
            catchError(() => {
                passwordChangeStatus["status"] = backendInteractionStatus.BackendError;
                return throwError(() => new Error());
            })
        )
    }

    getAccountInformation(){
        return this.http.get<any>(
            "http://localhost:3001/users/account-information"
        ).pipe(
            catchError(() => {
                return this.handleError();
            })
        )
    }

    updateContractualIdentity(
        type: string,
        form: Record<string, string>,
        FormHelperIsTrigger: Record<string, boolean>,
        messageFormControl: FormControl,
        buttonIsLoading: Record<string, boolean>
        ) {
        let body: Record<string, string> = {}

        body["gender"] = form["gender"];
        body["postal_address"] = form["postalAddress"];
        body["birthdate"] = form["birthdate"];
        body["birthplace"] = form["birthplace"];
        body["citizenship"] = form["citizenship"];

        if (type == 'company') {
            body["company_name"] = form["companyName"];
            body["company_status"] = form["companyStatus"];
            body["capital"] = form["capital"];
            body["head_office_address"] = form["headOfficeAddress"];
            body["siret"] = form["siret"];
            body["type"] = "company";
        } else {
            body["type"] = "individual";
        }

        return this.http.put(
            "http://localhost:3001/users/contractual-identity",
            body
        ).pipe(
            catchError(() => {
                FormHelperIsTrigger['status'] = true;
                buttonIsLoading['status'] = false;
                messageFormControl.setValue('Une erreur est survenue. Merci de réessayer.');
                return this.handleError();
            })
        )
    }
}