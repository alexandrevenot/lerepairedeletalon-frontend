import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { catchError, throwError } from "rxjs";

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
    contact_name: string;
    contact_phone_number: string;
    contact_email: string;
    cover_type: string;
    cover_specs: any;
    provided_cover_place: string;
    arrival_date: string;
    status: string;
    price: number;
    base_price: number;
    buyer_message: string;
    timestamps: Array<Record<string, string>>;
    notes: string;
    pov: string;
}

@Injectable()
export class CoverPageService {
    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        console.log(error);
        return throwError(() => new Error());
    }

    getCoverInfo(coverId: string) {
        return this.http.get<GetCoverInfo>(
            `http://localhost:3001/covers/cover/${coverId}`
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
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
                return this.handleError(error);
            })
        )
    }

    stepForwardCover(coverId: string, nextStatus: string) {
        const body: Record<string, any> = {
            next_status: nextStatus
        }
        return this.http.post(
            `http://localhost:3001/covers/step-forward-cover/${coverId}`,
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
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
                return this.handleError(error);
            })
        )
    }
}