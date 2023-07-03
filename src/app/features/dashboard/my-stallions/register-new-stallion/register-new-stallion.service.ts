import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormControl} from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface getCityItem {
  city_name: string,
  postal_code: string,
  lat: number,
  lng: number
}

export interface getCityData {
  content: Array<getCityItem>
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

  getCity(
    input: string,
    success: {[key: string]: boolean},
    locationMessage: FormControl<any>) {
    let params = new HttpParams()
    .set('user_input', input);

    return this.http.get<getCityData>(
      "http://localhost:3001/geoloc/get-city",
      { params }
    ).pipe(
        catchError(() => {
            success['status'] = false;
            locationMessage.setValue("Veuillez vérifier l'orthographe de la ville ou en essayer une plus grande.")
            return throwError(() => new Error())
        })
      );
  }

  postRegisterNewStallion(
    form: { [key: string]: string },
    breed: string,
    color: string,
    cSaillies: File,
    photos: File[],
    rTypes: {[key: string]: boolean},
    submitted: {[key: string]: boolean},
    message: FormControl<any>,
    triggerEmptyMandatoryFields: {[key: string]: boolean}
    ) {

    const formData = new FormData();
    formData.append('breed', breed);
    formData.append('color', color);
    photos.forEach((file) => { formData.append('photos', file); });
    formData.append('c_saillies', cSaillies);

    const r_types = Object.keys(rTypes).filter(key => rTypes[key]).join(',');
    formData.append('r_types', r_types);

    const pedigreeL: string[] = [];
    for (let i = 1; i <= 14; i++) {
    const key = `p${i}`;
    pedigreeL.push(form[key]);
    }
    const pedigree = pedigreeL.join('~');
    formData.append('pedigree', pedigree);

    formData.append('name', form["name"]);
    formData.append('n_sire', form["nSIRE"]);
    formData.append('main_desc', form["mainDesc"]);
    formData.append('birthdate', form["birthdate"]);
    formData.append('height', form["height"]);
    formData.append('offspring', form["offspring"]);
    formData.append('performance', form["performance"]);
    formData.append('pedigree_po', form["pedigreePO"]);
    formData.append('comments', form["comments"]);
    formData.append('price', form["price"]);
    formData.append('location', form["location"])

    let headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(
      "http://localhost:3001/stallions/register-new-stallion",
      formData,
      {headers}
      ).pipe(
        catchError((error: HttpErrorResponse) => {
            submitted["status"] = false; 
            triggerEmptyMandatoryFields['status'] = true;
            return this.handleError(error, message);
        })
      );
  }

}