import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormControl} from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { getCityItem } from 'src/environments/geolocation';
import { deepCopy } from 'src/environments/environment';

interface FinalStallionFields {
  name: string;
  breed: string;
  n_sire: string;
  birthdate: string;
}

export interface SingularStallionSTDSpecs {
  test_date: string;
}

export interface SingularHostingSpecs {
  price: number;
}

export interface SingularMareSTDSpecs {
  test_oldness: number;
}

export interface LIBandHANDSpecs {
  price: number;
  balance_payment_condition: string;
  advance_percentage: number;
  cover_place: string;
  maximum_nb_of_attempts: number;
  hosting_specs: Record<string, SingularHostingSpecs>;
  demanded_std_negative_tests: Record<string, SingularMareSTDSpecs>;
  demanded_vaccines: Array<string>;
}

export interface IAISpecs {
  price: number;
  balance_payment_condition: string;
  advance_percentage: number;
  cover_place: string;
  maximum_nb_of_attempts: number;
  hosting_specs: Record<string, SingularHostingSpecs>;
}

export interface IARTSpecs {
  price: number;
  balance_payment_condition: string;
  advance_percentage: number;
  nb_provided_straws: number;
}

export interface IACSpecs {
  price: number;
  balance_payment_condition: string;
  advance_percentage: number;
  nb_provided_straws: number;
  left_straws_owner: string;
}

interface EditableStallionFields {
  main_desc: string;
  color: string;
  height: number;
  lat: number;
  lng: number;
  city: string;
  postal_code: string;
  production_breeds: Array<string>;
  cover_specs: Record<string, LIBandHANDSpecs | IAISpecs | IARTSpecs | IACSpecs>;
  pedigree: Array<string>;
  pedigree_po: string;
  cover_additional_info: string;
  performance: string;
  stallion_additional_info: string;
  stallion_std_negative_tests: Record<string, SingularStallionSTDSpecs>;
  stallion_vaccines: Array<string>;
  offspring: string;
  crossbreeding_advice: string;
}

interface StallionBody {
  final_fields_body: FinalStallionFields;
  editable_fields_body: EditableStallionFields;
}

interface EditStallionBody {
  editable_fields_body: EditableStallionFields
}

export interface PostStallionResponse {
  message: string;
  stallion_id: string;
}

@Injectable()
export class StallionService {
  constructor(private http: HttpClient) { }

  handleRegisterError(error: HttpErrorResponse, message: any) {
    if (error.status === 400) {
        message.setValue("Un étalon avec ce même numéro SIRE a déjà été ajouté.");
    } else {
        message.setValue('Une erreur est survenue. Merci de réessayer.');
    }
    return throwError(() => new Error());
  }

  handleBasicError(error: HttpErrorResponse) {
    return throwError(() => new Error());
  }

  uploadFiles(
    verificationFile: File,
    photos: File[],
    stallionId: string,
    submitted: Record<string, boolean>,
    message: FormControl<any>,
    triggerEmptyMandatoryFields: Record<string, boolean>
  ) {
    const formData = new FormData();
    photos.forEach((file) => { formData.append('photos', file); });
    formData.append('verification_file', verificationFile);

    let headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(
      `http://localhost:3001/stallions/stallion-files/${stallionId}`,
      formData,
      {headers}
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        submitted["status"] = false; 
        triggerEmptyMandatoryFields['status'] = true;
        return this.http.delete(
          `http://localhost:3001/stallions/stallion/${stallionId}`
        ).pipe(
          switchMap(() => {
            return this.handleRegisterError(error, message);
          }),
          catchError((error: HttpErrorResponse) => {
            return this.handleRegisterError(error, message);
          })
        );
      })
    );
  }

  uploadNewPhotos(
    photos: File[],
    stallionId: string,
    submitted: Record<string, boolean>,
    message: FormControl<any>,
    triggerEmptyMandatoryFields: Record<string, boolean>
  ) {
    const formData = new FormData();
    photos.forEach((file) => { formData.append('photos', file); });

    let headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.put(
      `http://localhost:3001/stallions/stallion-files/${stallionId}`,
      formData,
      {headers}
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleBasicError(error);
      })
    )
  }

  registerNewStallion(
    form: Record<string, string>,
    location: getCityItem,
    coverTypes: Array<string>,
    productionBreeds: Array<string>,
    stallionStdNegativeTests: Array<string>,
    stallionVaccines: Array<string>,
    hostingTypes: Record<string, Record<string, boolean>>,
    mareSTDs: Record<string, Record<string, boolean>>,
    mareVaccines: Record<string, Record<string, boolean>>,
    submitted: Record<string, boolean>,
    message: FormControl<any>,
    triggerEmptyMandatoryFields: Record<string, boolean>
  ) {

    const finalStallionFields: FinalStallionFields = {
      name: form["name"],
      breed: form["breed"],
      n_sire: form["nSIRE"],
      birthdate: form["birthdate"],
    }
    
    let pedigreeL: string[] = [];
    for (let i = 1; i <= 14; i++) {
      const key = `p${i}`;
      pedigreeL.push(form[key]);
    }

    let stallionSTDSpecs: Record<string, SingularStallionSTDSpecs> = {};
    stallionStdNegativeTests.forEach((std) => {
      stallionSTDSpecs[std] = {
        'test_date': form[std + 'StallionTestDate']
      }
    })

    let coverSpecs: Record<string, LIBandHANDSpecs | IAISpecs | IARTSpecs | IACSpecs> = {};
    for (let coverType of coverTypes) {
      let content: Record<string, any> = {};

      content['price'] = parseInt(form[coverType + 'Price']);
      content['balance_payment_condition'] = form[coverType + 'BalancePaymentCondition'];
      content['advance_percentage'] = parseInt(form[coverType + 'AdvancePercentage']);

      if (['lib', 'hand', 'iai'].includes(coverType)) {
        content['cover_place'] = form[coverType + 'CoverPlace'];
        content['maximum_nb_of_attempts'] = form[coverType + 'MaximumNumberOfAttempts']
        let hostingSpecs: Record<string, SingularHostingSpecs | null> = {};
        for (let [hostingType, value] of Object.entries(hostingTypes[coverType])) {
          if (value) {
            hostingSpecs[hostingType] = {price: parseInt(form[coverType + hostingType + 'Price'])};
          }
        }
        content["hosting_specs"] = deepCopy(hostingSpecs);

        let mareSTDSpecs: Record<string, SingularMareSTDSpecs | null> = {};
        for (let [std, value] of Object.entries(mareSTDs[coverType])) {
          if (value) {
            mareSTDSpecs[std] = {test_oldness: parseInt(form[coverType + std + 'MareTestOldness'])};
          }
        }
        content["demanded_std_negative_tests"] = deepCopy(mareSTDSpecs);

        content["demanded_vaccines"] = Object.keys(mareVaccines[coverType]).filter(key => mareVaccines[coverType][key]);
      }

      if (['iart', 'iac'].includes(coverType)) {
        content['nb_provided_straws'] = parseInt(form[coverType + 'NbProvidedStraws']);
      }

      if ('iac' === coverType) {
        content['left_straws_owner'] = form[coverType + 'LeftStrawsOwner'];
      }

      coverSpecs[coverType] = deepCopy(content);
    }

    const editableFieldsBody: EditableStallionFields = {
      main_desc: form["mainDesc"],
      color: form["color"],
      height: parseFloat(form["height"]),
      lat: location.lat,
      lng: location.lng,
      city: location.city,
      postal_code: location.postal_code,
      production_breeds: productionBreeds,
      cover_specs: coverSpecs,
      pedigree: pedigreeL,
      pedigree_po: form["pedigreePO"],
      cover_additional_info: form["coverAdditionalInfo"],
      performance: form["performance"],
      stallion_additional_info: form["stallionAdditionalInfo"],
      stallion_std_negative_tests: stallionSTDSpecs,
      stallion_vaccines: stallionVaccines,
      offspring: form["offspring"],
      crossbreeding_advice: form["crossbreedingAdvice"],
    }

    const completeBody: StallionBody = {
      editable_fields_body: editableFieldsBody,
      final_fields_body: finalStallionFields
    }

    return this.http.post<PostStallionResponse>(
      "http://localhost:3001/stallions/stallion",
      completeBody,
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        submitted["status"] = false; 
        triggerEmptyMandatoryFields['status'] = true;
        return this.handleRegisterError(error, message);
      })
    )
  }

  fetchStallionProfile(stallionId: string) {
    const params = new HttpParams()
    .set('mode', 'complete');

    return this.http.get(
      `http://localhost:3001/stallions/stallion/${stallionId}`,
      { params }
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        return this.handleBasicError(error);
      })
    )
  }

  editStallion(
    stallionId: string,
    form: Record<string, string>,
    location: getCityItem,
    coverTypes: Array<string>,
    productionBreeds: Array<string>,
    stallionStdNegativeTests: Array<string>,
    stallionVaccines: Array<string>,
    hostingTypes: Record<string, Record<string, boolean>>,
    mareSTDs: Record<string, Record<string, boolean>>,
    mareVaccines: Record<string, Record<string, boolean>>,
    submitted: Record<string, boolean>,
    message: FormControl<any>,
    triggerEmptyMandatoryFields: Record<string, boolean>
  ) {
    let pedigreeL: string[] = [];
    for (let i = 1; i <= 14; i++) {
      const key = `p${i}`;
      pedigreeL.push(form[key]);
    }

    let stallionSTDSpecs: Record<string, SingularStallionSTDSpecs> = {};
    stallionStdNegativeTests.forEach((std) => {
      stallionSTDSpecs[std] = {
        'test_date': form[std + 'StallionTestDate']
      }
    })

    let coverSpecs: Record<string, LIBandHANDSpecs | IAISpecs | IARTSpecs | IACSpecs> = {};
    for (let coverType of coverTypes) {
      let content: Record<string, any> = {};

      content['price'] = parseInt(form[coverType + 'Price']);
      content['balance_payment_condition'] = form[coverType + 'BalancePaymentCondition'];
      content['advance_percentage'] = parseInt(form[coverType + 'AdvancePercentage']);

      if (['lib', 'hand', 'iai'].includes(coverType)) {
        content['cover_place'] = form[coverType + 'CoverPlace'];
        content['maximum_nb_of_attempts'] = form[coverType + 'MaximumNumberOfAttempts']
        let hostingSpecs: Record<string, SingularHostingSpecs | null> = {};
        for (let [hostingType, value] of Object.entries(hostingTypes[coverType])) {
          if (value) {
            hostingSpecs[hostingType] = {price: parseInt(form[coverType + hostingType + 'Price'])};
          }
        }
        content["hosting_specs"] = deepCopy(hostingSpecs);

        let mareSTDSpecs: Record<string, SingularMareSTDSpecs | null> = {};
        for (let [std, value] of Object.entries(mareSTDs[coverType])) {
          if (value) {
            mareSTDSpecs[std] = {test_oldness: parseInt(form[coverType + std + 'MareTestOldness'])};
          }
        }
        content["demanded_std_negative_tests"] = deepCopy(mareSTDSpecs);

        content["demanded_vaccines"] = Object.keys(mareVaccines[coverType]).filter(key => mareVaccines[coverType][key]);
      }

      if (['iart', 'iac'].includes(coverType)) {
        content['nb_provided_straws'] = parseInt(form[coverType + 'NbProvidedStraws']);
      }

      if ('iac' === coverType) {
        content['left_straws_owner'] = form[coverType + 'LeftStrawsOwner'];
      }

      coverSpecs[coverType] = deepCopy(content);
    }

    const editableFieldsBody: EditableStallionFields = {
      main_desc: form["mainDesc"],
      color: form["color"],
      height: parseFloat(form["height"]),
      lat: location.lat,
      lng: location.lng,
      city: location.city,
      postal_code: location.postal_code,
      production_breeds: productionBreeds,
      cover_specs: coverSpecs,
      pedigree: pedigreeL,
      pedigree_po: form["pedigreePO"],
      cover_additional_info: form["coverAdditionalInfo"],
      performance: form["performance"],
      stallion_additional_info: form["stallionAdditionalInfo"],
      stallion_std_negative_tests: stallionSTDSpecs,
      stallion_vaccines: stallionVaccines,
      offspring: form["offspring"],
      crossbreeding_advice: form["crossbreedingAdvice"],
    }

    console.log(editableFieldsBody);

    return this.http.put(
      `http://localhost:3001/stallions/stallion/${stallionId}`,
      editableFieldsBody,
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        submitted["status"] = false; 
        triggerEmptyMandatoryFields['status'] = true;
        return this.handleRegisterError(error, message);
      })
    )
  }
}