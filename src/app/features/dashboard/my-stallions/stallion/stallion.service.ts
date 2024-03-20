import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormControl} from '@angular/forms';
import { throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { getCityItem } from 'src/app/core/geolocation/geolocation.service';
import { backendBaseUrl, backendInteractionStatus, deepCopy } from 'src/environments/environment';

interface FinalStallionFields {
  name: string;
  breed: string;
  n_sire: string;
  birthdate: string;
}

export interface SingularStallionSTDSpecs {
  test_date: string;
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
  demanded_std_negative_tests: Record<string, SingularMareSTDSpecs>;
  demanded_vaccines: Array<string>;
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
  cover_specs: Record<string, LIBandHANDSpecs>;
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
        message.setValue("Une erreur est survenue. C'est peut-être de notre côté. Merci de réessayer.");
    }
    return throwError(() => new Error());
  }

  uploadFiles(
    verificationFile: File,
    photos: Array<File | null>,
    stallionId: string,
    stallionFormStatus: Record<string, backendInteractionStatus>,
    message: FormControl<any>
  ) {
    const formData = new FormData();
    photos.forEach((file) => {
      if (file) {
        formData.append('photos', file);
      }
    });
    formData.append('verification_file', verificationFile);

    let headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.post(
      `${backendBaseUrl}/stallions/stallion-files/${stallionId}`,
      formData,
      {headers}
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        stallionFormStatus['status'] = backendInteractionStatus.BackendError;
        return this.http.delete(
          `${backendBaseUrl}/stallions/stallion/${stallionId}`
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
    keptPhotos: Array<number>,
    photos: Array<File | null>,
    stallionId: string,
    stallionFormStatus: Record<string, backendInteractionStatus>,
    message: FormControl<any>
  ) {
    const formData = new FormData();
    photos.forEach((file) => {
      if (file) {
        formData.append('new_photos', file);
      }
    });

    keptPhotos.forEach((index: number) => {formData.append('kept_photos', index.toString())})

    let headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');

    return this.http.put(
      `${backendBaseUrl}/stallions/stallion-files/${stallionId}`,
      formData,
      {headers}
    ).pipe(
      catchError(() => {
        stallionFormStatus["status"] = backendInteractionStatus.BackendError;
        message.setValue("Une erreur est survenue. C'est peut-être de notre côté. Merci de réessayer.");
        return throwError(() => new Error());
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
    mareSTDs: Record<string, Record<string, boolean>>,
    mareVaccines: Record<string, Record<string, boolean>>,
    stallionFormStatus: Record<string, backendInteractionStatus>,
    message: FormControl<any>,
  ) {
    const finalStallionFields: FinalStallionFields = {
      name: form["name"],
      breed: form["breed"],
      n_sire: form["nSIRE"],
      birthdate: form["birthdate"]
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

    let coverSpecs: Record<string, LIBandHANDSpecs> = {};
    for (let coverType of coverTypes) {
      let content: Record<string, any> = {};

      content['price'] = parseInt(form[coverType + 'Price']);
      content['balance_payment_condition'] = form[coverType + 'BalancePaymentCondition'];
      content['advance_percentage'] = parseInt(form[coverType + 'AdvancePercentage']);

      content['cover_place'] = form[coverType + 'CoverPlace'];
      content['maximum_nb_of_attempts'] = parseInt(form[coverType + 'MaximumNumberOfAttempts']);

      let mareSTDSpecs: Record<string, SingularMareSTDSpecs | null> = {};
      for (let [std, value] of Object.entries(mareSTDs[coverType])) {
        if (value) {
          mareSTDSpecs[std] = {test_oldness: parseInt(form[coverType + std + 'MareTestOldness'])};
        }
      }
      content["demanded_std_negative_tests"] = deepCopy(mareSTDSpecs);

      content["demanded_vaccines"] = Object.keys(mareVaccines[coverType]).filter(key => mareVaccines[coverType][key]);

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
      `${backendBaseUrl}/stallions/stallion`,
      completeBody,
    ).pipe(
      catchError(() => {
        stallionFormStatus["status"] = backendInteractionStatus.BackendError; 
        message.setValue("Une erreur est survenue. C'est peut-être de notre côté. Merci de réessayer.");
        return throwError(() => new Error());
      })
    )
  }

  fetchStallionProfile(stallionId: string) {
    const params = new HttpParams()
    .set('mode', 'for_edition');

    return this.http.get(
      `${backendBaseUrl}/stallions/stallion/${stallionId}`,
      { params }
    ).pipe(
      catchError(() => {
        return throwError(() => new Error());
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
    mareSTDs: Record<string, Record<string, boolean>>,
    mareVaccines: Record<string, Record<string, boolean>>,
    stallionFormStatus: Record<string, backendInteractionStatus>,
    message: FormControl<any>,
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

    let coverSpecs: Record<string, LIBandHANDSpecs> = {};
    for (let coverType of coverTypes) {
      let content: Record<string, any> = {};

      content['price'] = parseInt(form[coverType + 'Price']);
      content['balance_payment_condition'] = form[coverType + 'BalancePaymentCondition'];
      content['advance_percentage'] = parseInt(form[coverType + 'AdvancePercentage']);

      content['cover_place'] = form[coverType + 'CoverPlace'];
      content['maximum_nb_of_attempts'] = form[coverType + 'MaximumNumberOfAttempts']

      let mareSTDSpecs: Record<string, SingularMareSTDSpecs | null> = {};
      for (let [std, value] of Object.entries(mareSTDs[coverType])) {
        if (value) {
          mareSTDSpecs[std] = {test_oldness: parseInt(form[coverType + std + 'MareTestOldness'])};
        }
      }
      content["demanded_std_negative_tests"] = deepCopy(mareSTDSpecs);

      content["demanded_vaccines"] = Object.keys(mareVaccines[coverType]).filter(key => mareVaccines[coverType][key]);

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

    return this.http.put(
      `${backendBaseUrl}/stallions/stallion/${stallionId}`,
      editableFieldsBody,
    ).pipe(
      catchError(() => {
        stallionFormStatus["status"] = backendInteractionStatus.BackendError;
        message.setValue("Une erreur est survenue. C'est peut-être de notre côté. Merci de réessayer.");
        return throwError(() => new Error());
      })
    )
  }
}