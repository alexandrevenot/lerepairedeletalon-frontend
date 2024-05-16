import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { catchError } from 'rxjs';
import { backendBaseUrl } from 'src/environments/environment';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent implements OnInit{
  public code: string = "";
  public message = new FormControl('');

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.code = params['code'];
      if (this.code) {
        const body = {
          code: this.code
        }
        this.http.put(
          `${backendBaseUrl}/mailing/verify-email-address`,
          body
        ).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status == 403) {
              this.message.setValue("Cet email de vérification n'est plus valide.");
            } else {
              this.message.setValue("Une erreur est survenue. C'est peut-être de notre côté.");
            }
            throw new Error();
          })
        ).subscribe({
          next: () => {
            this.message.setValue('Merci, votre email est à présent vérifié.');
          },
          error: () => {}
        });
      }
    })
  }
}
