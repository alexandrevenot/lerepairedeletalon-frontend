import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { FormControl } from '@angular/forms';
import { backendBaseUrl, backendInteractionStatus, stripePK } from 'src/environments/environment';
import { Stripe, loadStripe } from '@stripe/stripe-js';

export interface LegalIdentity {
    level: number;
    business_type: "individual" | "company";
    gender: "Monsieur" | "Madame" | null;
    company_structure: string | null;
    company_name: string | null;
    capital: string | null;
    rcs: string | null;
    siren: string | null;
    head_office_address_line1: string | null;
    head_office_address_line2: string | null;
    head_office_address_postal_code: string | null;
    head_office_address_city: string | null;
    role_in_company: string | null;
    birthdate: string | null;
    birthplace: string | null;
    citizenship: string | null;
    address_line1: string | null;
    address_line2: string | null;
    address_postal_code: string | null;
    address_city: string | null;
    iban_last4: string | null;
}

export interface Account {
    user_id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone_number: string;
    legal_identity: LegalIdentity | null;
}

export interface StripeAccount {
    currently_due_is_empty: boolean;
    identity_document_status: "none" | "not_under_verification" | "pending" | "unverified" | "verified";
    proof_of_residence_status: "none" | "not_under_verification" | "pending" | "unverified" | "verified";
    proof_of_company_status: "none" | "not_under_verification" | "pending" | "unverified" | "verified" | null;
}

export interface PutLegalIdentityResponse {
    new_level: number
}

@Injectable()
export class MyAccountService {
    public stripe: Stripe | null = null;

    constructor(private http: HttpClient) {
        loadStripe(stripePK)
        .then((stripe) => {
          this.stripe = stripe;
        })
        .catch(() => {});
    }

    handleError() {
        return throwError(() => new Error());
    }

    handlePutLegalIdentityError(
        error: HttpErrorResponse,
        status: Record<string, backendInteractionStatus>,
        messageFormControl: FormControl
    ) {
        if (error.status == 422 && error.error.detail == "incorrect birthdate date format") {
            status['status'] = backendInteractionStatus.UserError;
            messageFormControl.setValue("La date de naissance doit être au format JJ/MM/AAAA, exemple: 07/10/1995.");
        }  else {
            status['status'] = backendInteractionStatus.BackendError;
            messageFormControl.setValue("Une erreur est survenue. C'est probablement de notre côté. Merci de réessayer.");
        }
        return throwError(() => new Error());
    }

    sendPasswordUpdateEmail(email: string, passwordChangeStatus: Record<string, backendInteractionStatus>) {
        const body = {
            "email": email
        }
        passwordChangeStatus["status"] = backendInteractionStatus.Loading;
        return this.http.post(
            `${backendBaseUrl}/mailing/send-password-update-email`,
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
            `${backendBaseUrl}/users/account-information`
        ).pipe(
            catchError(() => {
                return this.handleError();
            })
        )
    }

    deleteAccount(passphrase: string, helper: Record<string, backendInteractionStatus>, inputFC: FormControl) {
        const body = {
            passphrase: passphrase
        }
        return this.http.put(
            `${backendBaseUrl}/users/delete-account`,
            body
        ).pipe(catchError(() => {
            inputFC.setValue("");
            helper['status'] = backendInteractionStatus.BackendError;
            return throwError(() => new Error());
        }))
    }

    putLegalIdentity1(
        businessType: string,
        form: Record<string, string>,
        status: Record<string, backendInteractionStatus>,
        messageFormControl: FormControl
        ) {
        let body: Record<string, any> = {}

        body["gender"] = form["gender"];

        if (businessType == 'company') {
            body["business_type"] = "company";
            body["company_name"] = form["companyName"];
            body["company_structure"] = form["companyStructure"];
            body["capital"] = form["capital"];
            body["siren"] = form["siren"];
            body["head_office_address_line1"] = form["headOfficeAddressLine1"];
            body["head_office_address_postal_code"] = form["headOfficeAddressPostalCode"];
            body["head_office_address_city"] = form["headOfficeAddressCity"];
            body["role_in_company"] = form["roleInCompany"];
            body["head_office_address_line2"] = form["headOfficeAddressLine2"]
            body["rcs"] = form["rcs"]
        } else {
            body["business_type"] = "individual";
            body["birthdate"] = form["birthdate"];
            body["birthplace"] = form["birthplace"];
            body["citizenship"] = form["citizenship"];
            body["address_line1"] = form["addressLine1"];
            body["address_postal_code"] = form["addressPostalCode"];
            body["address_city"] = form["addressCity"];
            body["address_line2"] = form["addressLine2"]
        }

        return this.http.put<PutLegalIdentityResponse>(
            `${backendBaseUrl}/users/legal-identity`,
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handlePutLegalIdentityError(error, status, messageFormControl);
            })
        )
    }

    putLegalIdentity2(
        businessType: string,
        form: Record<string, string>,
        status: Record<string, backendInteractionStatus>,
        messageFormControl: FormControl
    ) {
        let body: Record<string, any> = {};
        body["business_type"] = businessType

        if (businessType == "company") {
            body["birthdate"] = form["birthdate"];
            body["address_line1"] = form["addressLine1"];
            body["address_postal_code"] = form["addressPostalCode"];
            body["address_city"] = form["addressCity"];
            body["address_line2"] = form["addressLine2"];
        }

        return this.http.put<PutLegalIdentityResponse>(
            `${backendBaseUrl}/users/legal-identity`,
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handlePutLegalIdentityError(error, status, messageFormControl);
            })
        )
    }

    sendFileToStripe(purpose: any, file: File) {
        const data = new FormData();
        data.append('file', file);
        data.append('purpose', purpose);

        const headers = new HttpHeaders({
            'Authorization': `Bearer ${stripePK}`
        });

        return this.http.post<any>('https://uploads.stripe.com/v1/files', data, {headers});
    }

    // POST STRIPE ACCOUNT
    createStripeAccountTokenForCompany(form0: Record<any, any>, form1: Record<any, any>, documentFrontId: any) {
        let body: any = {
            business_type: "company",
            tos_shown_and_accepted: true,
            company: {
                name: form1['companyName'],
                phone: '+33' + form0['phoneNumber'].slice(1),
                tax_id: form1['siren'],
                address: {
                  line1: form1['headOfficeAddressLine1'],
                  city: form1['headOfficeAddressCity'],
                  postal_code: form1['headOfficeAddressPostalCode'],
                },
                verification: {
                    document: {
                        front: documentFrontId
                    }
                }
            }
        }

        if (form1['headOfficeAddressLine2']) {
            body.company.address.line2 = form1['headOfficeAddressLine2']
        }

        return this.stripe?.createToken('account', body);
    }

    createStripeAccountTokenForCompanyRemainingInfo() {
        let body: any = {
            company: {
                directors_provided: true,
                owners_provided: true,
                executives_provided: true
            }
        }

        return this.stripe?.createToken('account', body);
    }

    createStripeAccountTokenForIndividual(
        form0: Record<any, any>,
        form1: Record<any, any>,
        identityDocumentFrontId: any,
        identityDocumentBackId: any,
        proofOfResidenceId: any
    ) {
        const splittedBirthdate = form1["birthdate"].split('/');
        const day = splittedBirthdate[0];
        const month = splittedBirthdate[1];
        const year = splittedBirthdate[2];

        let body: any = {
            business_type: "individual",
            tos_shown_and_accepted: true,
            individual: {
                first_name: form0["firstname"],
                last_name: form0["lastname"],
                phone: '+33' + form0['phoneNumber'].slice(1),
                email: form0['email'],
                dob: {
                    day: day,
                    month: month,
                    year: year
                },
                address: {
                    line1: form1["addressLine1"],
                    city: form1["addressCity"],
                    postal_code: form1["addressPostalCode"]
                },
                verification: {
                    document: {
                        front: identityDocumentFrontId
                    },
                    additional_document: {
                        front: proofOfResidenceId
                    }
                }
            }
        }
        if (form1['addressLine2']) {
            body.individual.address.line2 = form1['addressLine2']
        }
        if (identityDocumentBackId) {
            body.individual.verification.document.back = identityDocumentBackId;
        }

        return this.stripe?.createToken('account', body);
    }

    createStripePersonToken(form0: Record<any, any>, form1: Record<any, any>, form2: Record<any, any>,
        identityDocumentFrontId: any, identityDocumentBackId: any, proofOfResidenceId: any) {
        const splittedBirthdate = form2["birthdate"].split('/');
        const day = splittedBirthdate[0];
        const month = splittedBirthdate[1];
        const year = splittedBirthdate[2];
        let body: any = {
            person: {
                first_name: form0['firstname'],
                last_name: form0['lastname'],
                phone: '+33' + form0['phoneNumber'].slice(1),
                email: form0['email'],
                address: {
                    line1: form2['addressLine1'],
                    city: form2['addressCity'],
                    postal_code: form2['addressPostalCode']
                },
                dob: {
                    day: day,
                    month: month,
                    year: year
                },
                relationship: {
                    executive: true,
                    title: form1['roleInCompany'],
                    representative: true
                },
                verification: {
                    document: {
                        front: identityDocumentFrontId
                    },
                    additional_document: {
                        front: proofOfResidenceId
                    }
                }
            }
        }
        if (form2['addressLine2']) {
            body.person.address.line2 = form2['addressLine2']
        }
        if (identityDocumentBackId) {
            body.person.verification.document.back = identityDocumentBackId;
        }

        return this.stripe?.createToken('person', body);
    }

    createBankAccountToken(
        form0: Record<any, any>,
        form1: Record<any, any>,
        form2: Record<any, any>,
        businessType: string,

    ) {
        let body: any = {
            country: 'FR',
            currency: 'eur',
            account_number: form2["iban"].replace(/ /g, ''),
            account_holder_type: businessType
        }

        if (businessType == "individual") {
            body.account_holder_name = form0['firstname'] + ' ' + form0['lastname'];
        } else if (businessType == "company") {
            body.account_holder_name = form1['companyStructure'] + ' ' + form1['companyName'];
        }

        return this.stripe?.createToken('bank_account', body);
    }

    createStripeAccount(
        accountToken: string,
        personToken: string | null,
        companyRemainingInfoAccountToken: string | null,
        bankAccountToken: string,
        businessType: string,
        status: Record<string, backendInteractionStatus>,
        messageFormControl: FormControl
    ) {
        let body: Record<string, string> = {
            "business_type": businessType,
            "account_token": accountToken,
            "bank_account_token": bankAccountToken
        };

        if (personToken) {
            body["person_token"] = personToken;
        }

        if (companyRemainingInfoAccountToken) {
            body["additional_account_token"] = companyRemainingInfoAccountToken;
        }

        return this.http.post(
            `${backendBaseUrl}/payments/stripe-account`,
            body
        )
        .pipe(catchError(() => {
            status['status'] = backendInteractionStatus.BackendError;
            messageFormControl.setValue("Une erreur est survenue. C'est probablement de notre côté. Merci de réessayer.");
            return throwError(() => new Error());
        }))
    }

    // GET STRIPE ACCOUNT
    getStripeAccount() {
        return this.http.get<StripeAccount>(`${backendBaseUrl}/payments/stripe-account`)
        .pipe(catchError(() => {
            return throwError(() => new Error());
        }))
    }

    // PUT STRIPE ACCOUNT
    async createPartialStripeAccountTokenForIndividual1(form1: Record<any, any>, updatableFields: Record<string, string | undefined>) {
        let body: any = {};
        body.individual = {};
        if (form1["birthdate"] != updatableFields["birthdate"]) {
            await firstValueFrom(this.testDateFormat(form1["birthdate"]))
            const splittedBirthdate = form1["birthdate"].split('/');
            const day = splittedBirthdate[0];
            const month = splittedBirthdate[1];
            const year = splittedBirthdate[2];

            body.individual.dob = {
                day: day,
                month: month,
                year: year
            }
        }

        let address: any = {};
        if (form1["addressLine1"] != updatableFields["addressLine1"]) {
            address.line1 = form1["addressLine1"];
        }
        if (form1["addressLine2"] != updatableFields["addressLine2"]) {
            address.line2 = form1["addressLine2"]
        }
        if (form1["addressCity"] != updatableFields["addressCity"]) {
            address.city = form1["addressCity"]
        }
        if (form1["addressPostalCode"] != updatableFields["addressPostalCode"]) {
            address.postal_code = form1["addressPostalCode"]
        }
        if (Object.keys(address).length !== 0) {
            body.individual.address = address;
        }

        if (Object.keys(body.individual).length !== 0) {
            return this.stripe?.createToken('account', body);
        } else {
            return null;
        }
    }
    createPartialStripeAccountTokenForCompany1(form1: Record<any, any>, updatableFields: Record<string, string | undefined>) {
        let body: any = {};
        body.company = {};
        if (form1["companyName"] != updatableFields["companyName"]) {
            body.company.name = form1["companyName"];
        }
        if (form1["siren"] != updatableFields["siren"]) {
            body.company.tax_id = form1["siren"];
            body.tos_shown_and_accepted = true;
        }
        let address: any = {};
        if (form1["headOfficeAddressLine1"] != updatableFields["headOfficeAddressLine1"]) {
            address.line1 = form1["headOfficeAddressLine1"];
        }
        if (form1["headOfficeAddressLine2"] != updatableFields["headOfficeAddressLine2"]) {
            address.line2 = form1["headOfficeAddressLine2"]
        }
        if (form1["headOfficeAddressCity"] != updatableFields["headOfficeAddressCity"]) {
            address.city = form1["headOfficeAddressCity"]
        }
        if (form1["headOfficeAddressPostalCode"] != updatableFields["headOfficeAddressPostalCode"]) {
            address.postal_code = form1["headOfficeAddressPostalCode"]
        }
        if (Object.keys(address).length !== 0) {
            body.company.address = address;
        }

        if (Object.keys(body.company).length !== 0) {
            return this.stripe?.createToken('account', body);
        } else {
            return null;
        }
    }

    createPartialStripePersonToken1(form1: Record<any, any>, updatableFields: Record<string, string | undefined>) {
        if (form1["roleInCompany"] != updatableFields["roleInCompany"]) {
            let body: any = {
                person: {
                    relationship: {
                        title: form1['roleInCompany']
                    }
                }
            }
            return this.stripe?.createToken('person', body);
        } else {
            return null;
        }
    }

    createPartialStripeAccountTokenForCompany2(proofOfCompanyId: string | null) {
        if (proofOfCompanyId) {
            let body: any = {
                company: {
                    verification: {
                        document: {
                            front: proofOfCompanyId
                        }
                    }
                }
            };
            return this.stripe?.createToken('account', body);
        } else {
            return null;
        }
    }

    async createPartialStripePersonToken2(
        form2: Record<any, any>,
        updatableFields: Record<string, string | undefined>,
        identityDocumentFrontId: string | null,
        identityDocumentBackId: string | null,
        proofOfResidenceId: string | null
    ) {
        let body: any = {
            person: {}
        };

        if (form2["birthdate"] != updatableFields["birthdate"]) {
            await firstValueFrom(this.testDateFormat(form2["birthdate"]))
            const splittedBirthdate = form2["birthdate"].split('/');
            const day = splittedBirthdate[0];
            const month = splittedBirthdate[1];
            const year = splittedBirthdate[2];
            body.person.dob = {
                day: day,
                month: month,
                year: year
            }
        }

        let address: any = {}
        if (form2["addressLine1"] != updatableFields["addressLine1"]) {
            address.line1 = form2["addressLine1"]
        }
        if (form2["addressLine2"] != updatableFields["addressLine2"]) {
            address.line2 = form2["addressLine2"]
        }
        if (form2["addressCity"] != updatableFields["addressCity"]) {
            address.city = form2["addressCity"]
        }
        if (form2["addressPostalCode"] != updatableFields["addressPostalCode"]) {
            address.postal_code = form2["addressPostalCode"]
        }
        if (Object.keys(address).length !== 0) {
            body.person.address = address;
        }

        let verification: any = {}
        let document: any = {}
        if (identityDocumentFrontId) {
            document.front = identityDocumentFrontId
        }
        if (identityDocumentBackId) {
            document.back = identityDocumentBackId
        }
        if (Object.keys(document).length !== 0) {
            verification.document = document;
        }

        if (proofOfResidenceId) {
            verification.additional_document = {}
            verification.additional_document.front = proofOfResidenceId;
        }

        if (Object.keys(verification).length !== 0) {
            body.person.verification = verification;
        }

        if (Object.keys(body.person).length !== 0) {
            return this.stripe?.createToken('person', body);
        } else {
            return null;
        }
    }

    async createPartialStripeAccountTokenForIndividual2(
        identityDocumentFrontId: string | null,
        identityDocumentBackId: string | null,
        proofOfResidenceId: string | null
    ) {
        let body: any = {};
        body.individual = {};

        let verification: any = {}
        let document: any = {}
        if (identityDocumentFrontId) {
            document.front = identityDocumentFrontId
        }
        if (identityDocumentBackId) {
            document.back = identityDocumentBackId
        }
        if (Object.keys(document).length !== 0) {
            verification.document = document;
        }

        if (proofOfResidenceId) {
            verification.additional_document = {}
            verification.additional_document.front = proofOfResidenceId;
        }

        if (Object.keys(verification).length !== 0) {
            body.individual.verification = verification;
        }

        if (Object.keys(body.individual).length !== 0) {
            return this.stripe?.createToken('account', body);
        } else {
            return null;
        }
    }

    putStripeAccount(
        accountToken: string | null | undefined,
        personToken: string | null | undefined
    ) {
        let body: any = {};
        if (accountToken) {
            body.update_account_token = accountToken;
        }
        if (personToken) {
            body.update_person_token = personToken;
        }
        return this.http.put(
            `${backendBaseUrl}/payments/stripe-account`,
            body
        )
    }

    testDateFormat(date: string) {
        const params = new HttpParams()
        .set('date', date);

        return this.http.get(`${backendBaseUrl}/users/test-date-format`, {params})
    }
}