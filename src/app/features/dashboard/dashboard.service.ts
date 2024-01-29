import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { backendBaseUrl } from "src/environments/environment";

export interface BuyerNotifications {
    denied: Array<string> | null;
    pendingApproval: Array<string> | null;
    pendingSignature: Array<string> | null;
}

export interface SellerNotifications {
    pendingApproval: Array<string> | null;
    pendingSignature: Array<string> | null;
    onGoing: Array<string> | null;
    done: Array<string> | null;
}

export interface CoverNotifications {
    buyer: BuyerNotifications | null;
    seller: SellerNotifications | null;
}

@Injectable()
export class DashboardService {
    constructor(private http: HttpClient) {}

    getCoverNotifications() {
        return this.http.get<CoverNotifications>(
            `${backendBaseUrl}/users/cover-notifications`
        ).pipe(
            catchError(() => {
                return throwError(() => new Error());
            })
        )
    }

    acknowledgeCoverNotifications(
        coverIds: Array<string>,
        pov: string,
        group: string
    ) {
        const body = {
            cover_ids: coverIds,
            pov: pov,
            group: group
        };

        return this.http.post(
            `${backendBaseUrl}/users/cover-notifications`,
            body
        ).pipe(
            catchError(() => {return throwError(() => new Error())})
        )
    }
}