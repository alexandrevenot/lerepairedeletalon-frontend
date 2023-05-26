import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { FormControl} from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface registerNewStallionData {
    message: string;
  }

@Injectable()
export class RegisterNewStallionService {
  constructor(private http: HttpClient) { }

  handleError(error: HttpErrorResponse, message: any) {
    if (error.status === 400) {
        message.setValue("Un étalon avec ce même numéro SIRE a déjà été ajouté.");
    } else {
        message.setValue('Une erreur est survenue. Merci de réessayer.');
    }
    return throwError(() => new Error());
  }

  postRegisterNewStallion(
    form: { [key: string]: string },
    breed: string,
    color: string,
    cSaillies: File,
    photos: File[],
    rTypes: {[key: string]: boolean},
    submitted: {[key: string]: boolean},
    message: FormControl<any>
    ) {
    const formData = new FormData();
    formData.append('breed', breed);
    formData.append('color', color);
    photos.forEach((file) => { formData.append('photos', file); });
    console.log(formData);
    formData.append('c_saillies', cSaillies);

    const r_types = Object.values(rTypes).join(',');
    formData.append('r_types', r_types);

    const pedigreeL: string[] = [];
    for (let i = 1; i <= 14; i++) {
    const key = `p${i}`;
    pedigreeL.push(form[key]);
    }
    const pedigree = pedigreeL.join(',');
    formData.append('pedigree', pedigree);

    formData.append('name', form["name"]);
    formData.append('n_sire', form["nSIRE"]);
    formData.append('main_desc', form["mainDesc"]);
    formData.append('birth_date', form["birthDate"]);
    formData.append('height', form["height"]);
    formData.append('offspring', form["offspring"]);
    formData.append('performance', form["performance"]);
    formData.append('pedigree_po', form["pedigreePO"]);
    formData.append('comments', form["comments"]);
    formData.append('price', form["price"]);

    let headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post<registerNewStallionData>(
      "http://localhost:3001/stallions/register-new-stallion",
      formData,
      {headers}
      ).pipe(
        catchError((error: HttpErrorResponse) => {
            submitted["status"] = false; 
            return this.handleError(error, message);
        })
      );
  }

}