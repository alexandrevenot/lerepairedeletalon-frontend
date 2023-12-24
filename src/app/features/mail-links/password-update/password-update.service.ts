import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, throwError } from "rxjs";
import { backendInteractionStatus } from "src/environments/environment";

@Injectable()
export class PasswordUpdateService {
    constructor(private http: HttpClient) {}

    updatePassword(
        code: string,
        newPassword: string,
        status: Record<string, backendInteractionStatus>
    ) {
        const body = {
            code: code,
            new_password: newPassword
        }

        status["value"] = backendInteractionStatus.Loading;
        return this.http.put(
            "http://localhost:3001/mailing/update-password",
            body
        ).pipe(
            catchError(() => {
                status["value"] = backendInteractionStatus.BackendError;
                return throwError(() => new Error());
            })
        )
    }
}