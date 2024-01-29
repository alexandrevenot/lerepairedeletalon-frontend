import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { catchError, throwError } from "rxjs";
import { backendInteractionStatus } from "src/environments/environment";

export interface GetCoverInfo {
    stallion_name: string;
    stallion_breed: string;
    stallion_nsire: string;
    stallion_production_breeds: Array<string>;
    stallion_vaccines: Array<string>;
    stallion_std_negative_tests: any;
    mare_name: string;
    mare_breed: string;
    mare_nsire: string;
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

@Injectable()
export class CoverPageService {
    constructor(private http: HttpClient) {}

    getCoverInfo(coverId: string) {
        return this.http.get<GetCoverInfo>(
            `http://localhost:3001/covers/cover/${coverId}`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return throwError(() => new Error());
            })
        )
    }

    updateNotes(coverId: string, notes: string, message: FormControl, success: Record<string, boolean>) {
        const body: Record<string, string> = {
            notes: notes
        }
        return this.http.put(
            `http://localhost:3001/covers/cover-notes/${coverId}`,
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
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
            `http://localhost:3001/covers/step-forward-cover/${coverId}`,
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                buttonStatus["status"] = backendInteractionStatus.BackendError;
                message.setValue("Une erreur est survenue. C'est peut-être de notre côté. Veuillez réessayer s'il vous plaît.")
                return throwError(() => new Error());
            })
        )
    }

    putCover(coverId: string, valueType: "arrivalDate" | "basePrice", value: string | number,
        failed: Record<string, boolean>, display: Record<string, boolean>) {
        let body: Record<string, any> = {};
        if (valueType == "arrivalDate") {
            body["arrival_date"] = value;
        } else {
            body["new_subtotal"] = value;
        }
        return this.http.put(
            `http://localhost:3001/covers/cover/${coverId}`,
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                failed["value"] = true;
                display["value"] = true;
                return throwError(() => new Error());
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
            `http://localhost:3001/users/reviews/${userId}`,
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
}