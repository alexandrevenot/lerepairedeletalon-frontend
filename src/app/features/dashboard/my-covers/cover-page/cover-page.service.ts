import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Form, FormControl } from "@angular/forms";
import { catchError, throwError } from "rxjs";
import { backendBaseUrl, backendInteractionStatus } from "src/environments/environment";

export interface GetCoverInfo {
    stallion_name: string;
    stallion_breed: string;
    stallion_nsire: string;
    stallion_color: string;
    stallion_height: number;
    stallion_birthdate: string;
    stallion_offspring: string;
    stallion_performance: string;
    stallion_pedigree: Array<string>;
    stallion_pedigree_po: string;
    stallion_std_negative_tests: any;
    stallion_vaccines: Array<string>;
    stallion_production_breeds: Array<string>;
    mare_name: string;
    mare_breed: string;
    mare_nsire: string;
    mare_pregnancy_history: string;
    contact_id: string;
    contact_firstname: string;
    contact_lastname: string;
    contact_phone_number: string;
    contact_email: string;
    cover_type: string;
    cover_specs: any;
    arrival_date: string;
    status: string;
    price: number;
    base_price: number;
    buyer_message: string;
    timestamps: Array<Record<string, string>>;
    notes: string;
    reviewed_by_buyer: boolean;
    reviewed_by_seller: boolean;
    pov: string;
}

export interface SignUrlData {
    url: string;
}

@Injectable()
export class CoverPageService {
    constructor(private http: HttpClient) {}

    getCoverInfo(coverId: string) {
        return this.http.get<GetCoverInfo>(
            `${backendBaseUrl}/covers/cover/${coverId}`
        ).pipe(
            catchError(() => {
                return throwError(() => new Error());
            })
        )
    }

    updateNotes(coverId: string, notes: string, message: FormControl, success: Record<string, boolean>) {
        const body: Record<string, string> = {
            notes: notes
        }
        return this.http.put(
            `${backendBaseUrl}/covers/cover-notes/${coverId}`,
            body
        ).pipe(
            catchError(() => {
                message.setValue("Erreur lors de la sauvegarde des notes");
                success['status'] = false;
                return throwError(() => new Error());
            })
        )
    }

    stepForwardCover(coverId: string, nextStatus: string,
        buttonStatus: Record<string, backendInteractionStatus>,
        message: FormControl) {
        const body: Record<string, any> = {
            next_status: nextStatus
        }
        return this.http.post(
            `${backendBaseUrl}/covers/step-forward-cover/${coverId}`,
            body
        ).pipe(
            catchError(() => {
                buttonStatus["status"] = backendInteractionStatus.BackendError;
                message.setValue("Une erreur est survenue. C'est peut-être de notre côté. Veuillez réessayer s'il vous plaît.")
                return throwError(() => new Error());
            })
        )
    }

    handlePutCoverErrors(error: HttpErrorResponse, status: Record<string, backendInteractionStatus>, fc: FormControl) {
        if (error.status === 422) {
            if (error.error.detail === "incorrect arrival date format") {
                status['status'] = backendInteractionStatus.UserError;
                fc.setValue("Erreur dans le format de la date, veuillez s'il vous plaît utiliser le format JJ/MM/AAAA, exemple: 15/02/2024");
            } else if (error.error.detail && error.error.detail[0] === "<") {
                status['status'] = backendInteractionStatus.UserError;
                const minimalDate = error.error.detail.slice(1);
                fc.setValue("La date d'arrivée le plus tôt possible est le " + minimalDate);
            } else if (error.error.detail && error.error.detail[0] === ">") {
                status['status'] = backendInteractionStatus.UserError;
                const maximalDate = error.error.detail.slice(1);
                fc.setValue("La date d'arrivée la plus tardive est le " + maximalDate);
            } else {
                status['status'] = backendInteractionStatus.BackendError;
                fc.setValue("Une erreur est survenue. C'est probablement de notre côté. Veuillez réessayer s'il vous plaît.");
            }
        } else {
            status['status'] = backendInteractionStatus.BackendError;
            fc.setValue("Une erreur est survenue. C'est probablement de notre côté. Veuillez réessayer s'il vous plaît.");
        }
        return throwError(() => new Error());
    }

    putCover(coverId: string, valueType: "arrivalDate" | "basePrice", value: string | number,
        status: Record<string, backendInteractionStatus>, fc: FormControl) {
        let body: Record<string, any> = {};
        if (valueType == "arrivalDate") {
            body["arrival_date"] = value;
        } else {
            body["new_subtotal"] = value;
        }
        return this.http.put(
            `${backendBaseUrl}/covers/cover/${coverId}`,
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handlePutCoverErrors(error, status, fc)
            })
        )
    }

    postReview(
        userId: string,
        coverId: string,
        score: number,
        content: string,
        reviewStatus: Record<string, string>
    ) {
        return this.http.post(
            `${backendBaseUrl}/users/reviews/${userId}`,
            {
                cover_id: coverId,
                score: score,
                content: content
            }
        ).pipe(
            catchError(() => {
                reviewStatus['status'] = "backendError";
                return throwError(() => new Error());
            })
        )
    }

    handleGetSignUrlError(error: HttpErrorResponse, status: Record<string, backendInteractionStatus>, fc: FormControl) {
        if (error.status === 409) {
            if (error.error.detail === "insufficient legal identity level for buyer") {
                status['status'] = backendInteractionStatus.UserError;
                fc.setValue(
                    "Il nous manque des informations à propos de votre identité pour pouvoir éditer le contrat. "
                    + "Rendez-vous s'il vous plaît dans votre Tableau de bord, section Mon compte, "
                    + "et remplissez le complément d'identité de niveau 1."
                );
            } else if (error.error.detail === "insufficient legal identity level for seller") {
                status['status'] = backendInteractionStatus.UserError;
                fc.setValue(
                    "Le profil du vendeur est incomplet, il n'est pas encore possible de signer de contrat pour ses étalons. "
                    + "Nous l'informons que vous avez tenté de signer le contrat."
                );
            }
        }
        return throwError(() => new Error());
    }

    getSignUrl(coverId: string, status: Record<string, backendInteractionStatus>, fc: FormControl) {
        return this.http.get<SignUrlData>(
            `${backendBaseUrl}/contracts/sign-page-url/${coverId}`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleGetSignUrlError(error, status, fc);
            })
        )
    }
}