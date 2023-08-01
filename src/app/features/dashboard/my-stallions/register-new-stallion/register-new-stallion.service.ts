import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormControl} from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { getCityItem } from 'src/environments/geolocation';

@Injectable()
export class RegisterNewStallionService {
  constructor(private http: HttpClient) { }

  handleRegisterError(error: HttpErrorResponse, message: any) {
    if (error.status === 400) {
        message.setValue("Un étalon avec ce même numéro SIRE a déjà été ajouté.");
    } else {
        message.setValue('Une erreur est survenue. Merci de réessayer.');
    }
    return throwError(() => new Error());
  }

  postRegisterNewStallion(
    form: { [key: string]: string },
    location: getCityItem,
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
    formData.append('lat', location.lat.toString());
    formData.append('lng', location.lng.toString());
    formData.append('city', location.city_name);
    formData.append('postal_code', location.postal_code);
    formData.append('breed', breed);
    formData.append('color', color);
    photos.forEach((file) => { formData.append('photos', file); });
    formData.append('c_saillies', cSaillies);

    const coverTypesList = Object.keys(rTypes).filter(key => rTypes[key]);
    let prices = [];
    for (const coverType of coverTypesList) {
      prices.push(form[coverType + 'Price']);
    }
    formData.append('prices', prices.join(','));
    formData.append('cover_types', coverTypesList.join(','));

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
    formData.append('stallion_additional_info', form["stallionAdditionalInfo"]);
    formData.append('cover_additional_info', form["coverAdditionalInfo"]);

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
            return this.handleRegisterError(error, message);
        })
      );
  }

}