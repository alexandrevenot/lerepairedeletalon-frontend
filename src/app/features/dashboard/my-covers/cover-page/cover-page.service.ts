import { HttpClient, HttpErrorResponse, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FormControl } from "@angular/forms";
import { catchError, throwError } from "rxjs";

export interface GetCoverInfo {
    stallion_name: string;
    stallion_breed: string;
    stallion_nsire: string;
    mare_name: string;
    mare_breed: string;
    mare_nsire: string;
    contact_name: string;
    contact_phone_number: string;
    contact_email: string;
    cover_type: string;
    cover_place: string;
    price: number;
    buyer_message: string;
    timestamps: Record<string, string>;
    notes: string;
    status: string;
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
        let params = new HttpParams()
        .set('cover_id', coverId);

        return this.http.get<GetCoverInfo>(
            "http://localhost:3001/covers/cover-information",
            { params }
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    updateNotes(coverId: string, notes: string, message: FormControl, success: Record<string, boolean>) {
        const body: Record<string, string> = {
            cover_id: coverId,
            notes: notes
        }
        return this.http.put(
            "http://localhost:3001/covers/update-notes",
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                message.setValue("Erreur lors de la sauvegarde des notes");
                success['status'] = false;
                return this.handleError(error);
            })
        )
    }

    answerProposal(coverId: string, refuse: boolean = false) {
        const body: Record<string, any> = {
            cover_id: coverId,
            refuse: refuse
        }
        return this.http.post(
            "http://localhost:3001/covers/step-forward-cover",
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }

    createContract(coverId: string) {
        const body: Record<string, string> = {
            cover_id: coverId
        }
        return this.http.post(
            "http://localhost:3001/contracts/engage-signature-process",
            body
        ).pipe(
            catchError((error: HttpErrorResponse) => {
                return this.handleError(error);
            })
        )
    }
}