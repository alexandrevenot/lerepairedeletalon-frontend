import { Component, HostListener, Input, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PostStallionResponse, StallionService } from './stallion.service';
import { getAvailableBreeds, breedsRecord, availableCoverTypes, coverPlaceNames, getNumberArray, photosMaxSizeInBytes, splitListOrKeysList, balancePaymentConditions, stds, vaccines, objectStorageBaseUrl, photosPrefix, backendInteractionStatus, backendBaseUrl, verificationFileMaxSizeInBytes } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GeolocationService, getCityData, getCityItem } from 'src/environments/geolocation';
import { Router } from '@angular/router';

export interface StallionComponentInput {
  mode: 'edition' | 'creation';
  stallionId: string | null;
}

@Component({
  selector: 'app-stallion',
  templateUrl: './stallion.component.html',
  styleUrls: ['./stallion.component.css'],
  providers: [
    StallionService,
    GeolocationService
  ]
})
export class StallionComponent implements OnInit {

  @Input() stallionComponentInput: StallionComponentInput = {
    mode: 'creation',
    stallionId: null
  };

  // imported variables and functions
  public breedsRecord = breedsRecord;
  public availableBreedTypes = Object.keys(breedsRecord);
  public availableBreeds = getAvailableBreeds();
  public availableCoverTypes = availableCoverTypes;
  public coverPlaceNames = coverPlaceNames;
  public photosMaxSizeInBytes = photosMaxSizeInBytes;
  public verificationFileMaxSizeInBytes = verificationFileMaxSizeInBytes;
  public getNumberArray = getNumberArray;
  public splitListOrKeysList = splitListOrKeysList;
  public balancePaymentConditions = balancePaymentConditions;
  public stdsRecord = stds;
  public vaccinesRecord = vaccines;
  public availableStds = Object.keys(this.stdsRecord);
  public availableVaccines = Object.keys(this.vaccinesRecord);
  public objectStorageBaseUrl = objectStorageBaseUrl;
  public photosPrefix = photosPrefix;

  // helpers
  public submitHelper: FormControl = new FormControl('');
  public photosHelper: FormControl= new FormControl('');
  public verificationFileHelper: FormControl= new FormControl('');
  public locationHelper: FormControl = new FormControl('');
  public birthdateHelper: FormControl = new FormControl('');

  // form validation status
  public stallionFormStatus: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};
  public locationSearchSuccess: Record<string, boolean> = {status: false};

  // form booleans
  public isLookingForLocation: boolean = false;
  public locationIsValidated: boolean = false;
  public stallionHasUnregisteredBreed: boolean = false;
  public stallionHasUnregisteredProductionBreeds: boolean = false;

  // form variables
  public coverTypes: Record<string, boolean> = {};
  public productionBreeds: Record<string, boolean> = {};
  public stallionStdNegativeTests: Record<string, boolean> = {};
  public stallionVaccines: Record<string, boolean> = {};
  public verificationFile!: File;
  public photos: Array<File | null> = [];
  public mareSTDs: Record<string, Record<string, boolean>> = {};
  public mareVaccines: Record<string, Record<string, boolean>> = {};

  // tools variables
  public title: 'Ajouter un nouvel étalon' | "Éditer le profil d'un étalon" = 'Ajouter un nouvel étalon';
  public photosURLs: SafeUrl[] = [];
  public locations: getCityItem[] = [];
  public locationTagValues: string[] = [];
  public selectedLocation: getCityItem = {
    city: "",
    postal_code: "",
    lat: 0,
    lng: 0
  };
  public geolocationInputTimer: any;
  public geolocStatus: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};
  public displayGeolocDd: boolean = false;
  public productionBreedsAddedByHand: Array<string> = [];
  public saveButtonIsDisabled: boolean = false;

  // only when editing
  public keptPhotos: Array<number> = [];

  // form values variables
  public stallionForm!: FormGroup;

  constructor(
    private stallionService: StallionService,
    private geolocationService: GeolocationService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private router: Router
    ) {}
  
  ngOnInit(): void {
    this.stallionComponentInput.mode === 'edition' ? this.title = "Éditer le profil d'un étalon" : this.title = "Ajouter un nouvel étalon";

    this.stallionForm = this.formBuilder.group({
      name: ['', Validators.required],
      breed: ['Sélectionner', Validators.required],
      nSIRE: ['', Validators.required],
      mainDesc: ['', Validators.required],
      color: ['', Validators.required],
      height: ['', Validators.required],
      birthdate: ['', Validators.required],
      p1: '',
      p2: '',
      p3: '',
      p4: '',
      p5: '',
      p6: '',
      p7: '',
      p8: '',
      p9: '',
      p10: '',
      p11: '',
      p12: '',
      p13: '',
      p14: '',
      coverAdditionalInfo: '',
      performance: '',
      pedigreePO: '',
      stallionAdditionalInfo: '',
      offspring: '',
      crossbreedingAdvice: '',
      location: ['', Validators.required],
      newProductionBreed: ''
    })

    for (const std of this.availableStds) {
      this.stallionForm.addControl(std + 'StallionTestDate', new FormControl(''));
      this.stallionForm.get(std + 'StallionTestDate')?.disable();
    }

    for (const coverType of Object.keys(this.availableCoverTypes)) {
      this.stallionForm.addControl(coverType + 'Price', new FormControl(''));
      this.stallionForm.addControl(coverType + 'BalancePaymentCondition', new FormControl(''));
      this.stallionForm.addControl(coverType + 'AdvancePercentage', new FormControl(''));

      this.stallionForm.addControl(coverType + 'CoverPlace', new FormControl(''));
      this.stallionForm.addControl(coverType + 'MaximumNumberOfAttempts', new FormControl(''));

      this.mareSTDs[coverType] = {}
      for (const std of this.availableStds) {
        this.stallionForm.addControl(coverType + std + 'MareTestOldness', new FormControl(''));
        this.stallionForm.get(coverType + std + 'MareTestOldness')?.disable();
        this.mareSTDs[coverType][std] = false;
      }

      for (const vaccine of this.availableVaccines) {
        this.mareVaccines[coverType] = {vaccine: false};
      }

      this.coverTypes[coverType] = false;
    }

    if (this.stallionComponentInput.mode === 'edition') {
      this.fetchStallionProfile();
    }
  }

  fetchStallionProfile() {
    if (this.stallionComponentInput.stallionId) {
      this.stallionService.fetchStallionProfile(this.stallionComponentInput.stallionId)
      .subscribe({
        next: (data: any) => {
          this.stallionForm.get('name')?.setValue(data.name);
          this.stallionForm.get('name')?.disable();
          this.stallionForm.get('breed')?.setValue(data.breed);
          this.stallionForm.get('breed')?.disable();
          this.stallionForm.get('nSIRE')?.setValue(data.n_sire);
          this.stallionForm.get('nSIRE')?.disable();
  
          data.photos.forEach((url: string) => {
            this.photosURLs.push(objectStorageBaseUrl + photosPrefix + '/' + url);
            this.photos.push(null);
          })
          this.keptPhotos = getNumberArray(data.photos.length);
  
          this.stallionForm.get('mainDesc')?.setValue(data.main_desc);
          this.stallionForm.get('color')?.setValue(data.color);
          this.stallionForm.get('height')?.setValue(data.height);
          this.stallionForm.get('birthdate')?.setValue(data.birthdate);
          this.stallionForm.get('birthdate')?.disable();
  
          for (let [index, parent] of data.pedigree.entries()) {
            this.stallionForm.get('p' + (index + 1).toString())?.setValue(parent);
          }
  
          this.locationSearchSuccess['status'] = true;
          this.stallionForm.get('location')?.setValue(data.city + ' (' + data.postal_code + ')');
          this.locationIsValidated = true;
          this.selectedLocation.city = data.city;
          this.selectedLocation.postal_code = data.postal_code;
          this.selectedLocation.lat = data.lat;
          this.selectedLocation.lng = data.lng;
  
          this.stallionForm.get('crossbreedingAdvice')?.setValue(data.crossbreeding_advice);
  
          for (let vaccine of data.stallion_vaccines) {
            this.stallionVaccines[vaccine] = true;
          }
  
          for (let std of this.availableStds) {
            if (data.stallion_std_negative_tests[std]) {
              this.stallionStdNegativeTests[std] = true;
              this.stallionForm.get(std + 'StallionTestDate')?.setValue(data.stallion_std_negative_tests[std]["test_date"]);
              this.stallionForm.get(std + 'StallionTestDate')?.enable();
            }
          }
  
          this.stallionForm.get('offspring')?.setValue(data.offspring);
          this.stallionForm.get('performance')?.setValue(data.performance);
          this.stallionForm.get('pedigreePO')?.setValue(data.pedigree_po);
          this.stallionForm.get('stallionAdditionalInfo')?.setValue(data.stallion_additional_info);
  
          for (let productionBreed of data.production_breeds) {
            if (this.availableBreeds.includes(productionBreed)) {
              this.productionBreeds[productionBreed] = true;
            } else {
              this.triggerOtherProductionBreeds();
              this.productionBreedsAddedByHand.push(productionBreed);
            }
          }
  
          for (let coverType of Object.keys(this.availableCoverTypes)) {
            if (data.cover_specs[coverType]) {
              this.coverTypes[coverType] = true;
              this.stallionForm.get(coverType + 'Price')?.setValue(data.cover_specs[coverType].price);
              this.stallionForm.get(coverType + 'BalancePaymentCondition')?.setValue(data.cover_specs[coverType].balance_payment_condition);
              this.stallionForm.get(coverType + 'AdvancePercentage')?.setValue(data.cover_specs[coverType].advance_percentage);
  
              this.stallionForm.get(coverType + 'CoverPlace')?.setValue(data.cover_specs[coverType].cover_place);
              this.stallionForm.get(coverType + 'MaximumNumberOfAttempts')?.setValue(data.cover_specs[coverType].maximum_nb_of_attempts);
  
              for (let vaccine of data.cover_specs[coverType].demanded_vaccines) {
                this.mareVaccines[coverType][vaccine] = true;
              }
  
              for (let std of this.availableStds) {
                if (data.cover_specs[coverType].demanded_std_negative_tests[std]) {
                  this.stallionForm.get(coverType + std + 'MareTestOldness')?.setValue(data.cover_specs[coverType].demanded_std_negative_tests[std].test_oldness);
                  this.stallionForm.get(coverType + std + 'MareTestOldness')?.enable();
                  this.mareSTDs[coverType][std] = true;
                }
              }              
  
              this.stallionForm.get('coverAdditionalInfo')?.setValue(data.cover_additional_info);
            }
          }
        },
        error: () => {}
      })
    }
  }

  // checkboxes
  updateCheckbox(checkboxType: 'productionBreeds' | 'coverTypes' | 'stallionStdNegativeTests' | 'stallionVaccines', event: any) {
    this[checkboxType][event.target.id] = event.target.checked;

    if (checkboxType === 'stallionStdNegativeTests') {
      let formControl = this.stallionForm.get(event.target.id + 'StallionTestDate')
      event.target.checked? formControl?.enable(): formControl?.disable();
    }

  }

  getSelectedCheckboxes(checkboxType: 'coverTypes' | 'productionBreeds' | 'stallionStdNegativeTests' | 'stallionVaccines') {
    let list = [];
    for (let key of Object.keys(this[checkboxType])) {
      if (this[checkboxType][key]) {
        list.push(key);
      }
    }
    return list;
  }

  updateNestedCheckbox(coverType: string, formControlName: string, checkboxType: 'mareSTDs' | 'mareVaccines', event: any) {
    this[checkboxType][coverType][event.target.id] = event.target.checked;
    if (['mareSTDs'].includes(checkboxType)) {
      let formControl = this.stallionForm.get(formControlName)
      event.target.checked? formControl?.enable(): formControl?.disable();
    }
  }

  isChecked(checkboxType: 'productionBreeds' | 'coverTypes' | 'stallionStdNegativeTests' | 'stallionVaccines', id: any) {
    return this[checkboxType][id];
  }

  isCheckedNested(coverType: string, checkboxType: 'mareSTDs' | 'mareVaccines', id: any) {
    return this[checkboxType][coverType][id];
  }

  // files
  fetchVerificationFile(event: any) {
    const file: File = event.target.files[0];
    if (!file) {
      return
    }

    if (file.size > verificationFileMaxSizeInBytes) {
      this.verificationFileHelper.setValue('La taille du fichier doit être inférieure à 10 Mo. Celle du fichier sélectionné les dépasse.');
      return
    } 

    this.verificationFile = event.target.files[0];
    this.verificationFileHelper.setValue('');    
  }

  fetchPhotos(event: any) {
    const file: File = event.target.files[0];
    if (!file) {
      return
    }

    if (file.size > photosMaxSizeInBytes) {
      this.photosHelper.setValue('La taille de chaque photo doit être inférieure à 4Mo.');
      return
    }

    this.photos.push(file);

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {  
      URL.revokeObjectURL(img.src);
      
      this.photosURLs.push(this.sanitizer.bypassSecurityTrustUrl(img.src));
      this.photosHelper.setValue('');
    };
  }

  deletePhoto(index: number) {
    this.photos.splice(index, 1);
    this.photosURLs.splice(index, 1);
    if (this.stallionComponentInput.mode == 'edition') {
      this.keptPhotos.splice(index, 1);
    }
  }

  // Stud-books
  swapStallionHasUnregisteredBreed() {
    if (!this.stallionHasUnregisteredBreed) {
      this.stallionForm.get('breed')?.setValue('');
    }
    this.stallionHasUnregisteredBreed = !this.stallionHasUnregisteredBreed;
  }

  triggerOtherProductionBreeds() {
    this.stallionHasUnregisteredProductionBreeds = true;
  }

  addAnotherProductionBreed() {
    let value: string = this.stallionForm.get('newProductionBreed')?.value;
    if (!this.productionBreedsAddedByHand.includes(value)) {
      this.productionBreedsAddedByHand.push(value);
    }
  }

  deleteAddedByHandProductionBreed(index: number) {
    this.productionBreedsAddedByHand.splice(index, 1);
  }

  // geoloc
  onGeolocationInput() {
    clearTimeout(this.geolocationInputTimer);
    this.locationIsValidated = false;
    this.geolocationInputTimer = setTimeout(() => {
      this.findCity()
    }, 750)
  }

  onGeolocationFocus() {
    this.displayGeolocDd = true;
  }

  onGeolocationBlur() {
    clearTimeout(this.geolocationInputTimer);
    setTimeout(() => {
      this.displayGeolocDd = false;
    }, 200)
  }

  findCity() {
    const inputLocationValue = this.stallionForm.getRawValue().location;
    if (inputLocationValue == "") {
      return
    }
    this.geolocStatus["status"] = backendInteractionStatus.Loading;
    this.locations.splice(0, this.locations.length);
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.geolocationService.getCity(
      inputLocationValue,
      this.geolocStatus,
      this.locationHelper)
      .subscribe({
        next: (data: getCityData) => {
          for (let item of data.content) {
            this.locations.push(item);
            this.locationTagValues.push(item.city + " (" + item.postal_code + ")")
          }
          this.locationHelper.setValue("");
          this.geolocStatus["status"] = backendInteractionStatus.Success;
        },
        error: () => {}
      })
  }

  resetCity() {
    this.locations.splice(0, this.locations.length);
    this.locationIsValidated = false;
    const locationControl = this.stallionForm.get('location');
    if (locationControl) {
      locationControl.setValue("");
    }
  }

  confirmLocationValue(index: number) {
    this.displayGeolocDd = false;
    const locationControl = this.stallionForm.get('location');
    if (locationControl) {
      locationControl.setValue(this.locations[index].city);
    }
    this.locationHelper.setValue("");
    this.selectedLocation = this.locations[index];
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.locationIsValidated = true;
  }

  // numbers
  makeNumberInteger(formControlName: string) {
    this.stallionForm.get(formControlName)?.setValue(
      this.stallionForm.getRawValue()[formControlName]
      .replace(/\D/g, '')
    )
  }

  // checking form validity
  getValueInStallionForm(field: string) {
    return this.stallionForm.getRawValue()[field];
  }

  formControlValueIsBetween15and50(field: string) {
    const value = this.stallionForm.getRawValue()[field];
    return 15 <= value && value <= 50;
  }

  birthdateFormatIsCorrect() {
    return /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(this.getValueInStallionForm("birthdate"));
  }

  dropdownIsSelected(field: 'breed') {
    if (field === 'breed') {
      return this.stallionForm.get('breed')?.value && (this.stallionForm.get('breed')?.value != "Sélectionner");
    } else {
      return false;
    }
  }

  onSubmit() {
    if (this.stallionComponentInput.mode === "creation") {
      this.registerNewStallion();
    } else {
      this.editStallion();
    }
  }

  registerNewStallion() {
    // data validation
    let shouldThrowError = false;

    if (this.photos.length === 0) {
      this.photosHelper.setValue("Il faut au minimum une photo.");
      shouldThrowError = true;
    }

    if (!this.verificationFile) {
      this.verificationFileHelper.setValue("Une photo de test négatif est obligatoire.");
      shouldThrowError = true;
    }

    if (!this.birthdateFormatIsCorrect()) {
      shouldThrowError = true;
      if (this.getValueInStallionForm('birthdate')) {
        this.birthdateHelper.setValue("La date de naissance doit être au format JJ/MM/AAAA.");
      }
    }

    if (this.getSelectedCheckboxes('productionBreeds').length <= 0) {
      shouldThrowError = true;
    }

    if (this.getSelectedCheckboxes('coverTypes').length <= 0) {
      shouldThrowError = true;
    }

    if (!this.stallionForm.valid) {
      shouldThrowError = true;
    }

    const stallionFormValue = this.stallionForm.getRawValue();
    for (let coverType of this.getSelectedCheckboxes('coverTypes')) {
      if (
        !this.getValueInStallionForm(coverType + "Price")
        || !this.getValueInStallionForm(coverType + "BalancePaymentCondition")
        || !this.getValueInStallionForm(coverType + "AdvancePercentage")
        || !this.getValueInStallionForm(coverType + "CoverPlace")
        || !this.getValueInStallionForm(coverType + "MaximumNumberOfAttempts")
      ) {
        shouldThrowError = true;
      }

      if (!this.formControlValueIsBetween15and50(coverType + "AdvancePercentage")) {
        shouldThrowError = true;
      }

      for (let [std, value] of Object.entries(this.mareSTDs[coverType])) {
        if (value) {
          if (!this.getValueInStallionForm(coverType + std + 'MareTestOldness')) {
            shouldThrowError = true;
          }
        }
      }
    }

    // if data is not validated
    if (shouldThrowError) {
      this.stallionFormStatus['status'] = backendInteractionStatus.UserError;
      this.submitHelper.setValue("Certains champs du formulaire sont manquants ou contiennent des erreurs. Veuillez s'il vous plaît remonter la page, et les corriger.");
      throw new Error("Incomplete form");
    }

    // API calls
    this.stallionFormStatus['status'] = backendInteractionStatus.Loading;
    this.submitHelper.setValue('');
    return this.stallionService.registerNewStallion(
      this.stallionForm.getRawValue(),
      this.selectedLocation,
      this.getSelectedCheckboxes('coverTypes'),
      this.getSelectedCheckboxes('productionBreeds').concat(this.productionBreedsAddedByHand),
      this.getSelectedCheckboxes('stallionStdNegativeTests'),
      this.getSelectedCheckboxes('stallionVaccines'),
      this.mareSTDs,
      this.mareVaccines,
      this.stallionFormStatus,
      this.submitHelper,
      ).subscribe({
        next: (response: PostStallionResponse) => {
          return this.stallionService.uploadFiles(
            this.verificationFile,
            this.photos,
            response['stallion_id'],
            this.stallionFormStatus,
            this.submitHelper
          ).subscribe({
            next: () => {
              this.stallionFormStatus['status'] = backendInteractionStatus.Success;
              this.submitHelper.setValue('Étalon ajouté avec succès.');
            },
            error: () => {}
          })
        },
        error: () => {}
      });
  }

  editStallion() {
    // data validation
    let shouldThrowError = false;

    let nonNullPhotos = 0
    this.photos.forEach((photo: File | null) => {
      if (photo) {
        nonNullPhotos++;
      }
    })

    if (nonNullPhotos + this.keptPhotos.length === 0) {
      this.photosHelper.setValue("Il faut au minimum une photo.");
      shouldThrowError = true;
    }

    if (this.getSelectedCheckboxes('productionBreeds').length <= 0) {
      shouldThrowError = true;
    }

    if (this.getSelectedCheckboxes('coverTypes').length <= 0) {
      shouldThrowError = true;
    }

    if (!this.stallionForm.valid) {
      shouldThrowError = true;
    }

    const stallionFormValue = this.stallionForm.getRawValue();
    for (let coverType of this.getSelectedCheckboxes('coverTypes')) {
      if (
        !this.getValueInStallionForm(coverType + "Price")
        || !this.getValueInStallionForm(coverType + "BalancePaymentCondition")
        || !this.getValueInStallionForm(coverType + "AdvancePercentage")
        || !this.getValueInStallionForm(coverType + "CoverPlace")
        || !this.getValueInStallionForm(coverType + "MaximumNumberOfAttempts")
      ) {
        shouldThrowError = true;
      }

      if (!this.formControlValueIsBetween15and50(coverType + "AdvancePercentage")) {
        shouldThrowError = true;
      }

      for (let [std, value] of Object.entries(this.mareSTDs[coverType])) {
        if (value) {
          if (!this.getValueInStallionForm(coverType + std + 'MareTestOldness')) {
            shouldThrowError = true;
          }
        }
      }
    }
    
    // if data is not validated
    if (shouldThrowError) {
      this.stallionFormStatus['status'] = backendInteractionStatus.UserError;
      this.submitHelper.setValue("Certains champs du formulaire sont manquants ou contiennent des erreurs. Veuillez s'il vous plaît remonter la page, et les corriger.");
      throw new Error("Incomplete form");
    }

    if (this.stallionComponentInput.stallionId === null) {
      this.submitHelper.setValue('Une erreur est survenue. Merci de réessayer.');
      throw new Error();
    }

    const stallionId = this.stallionComponentInput.stallionId;

    this.stallionFormStatus['status'] = backendInteractionStatus.Loading;
    return this.stallionService.editStallion(
      stallionId,
      this.stallionForm.getRawValue(),
      this.selectedLocation,
      this.getSelectedCheckboxes('coverTypes'),
      this.getSelectedCheckboxes('productionBreeds').concat(this.productionBreedsAddedByHand),
      this.getSelectedCheckboxes('stallionStdNegativeTests'),
      this.getSelectedCheckboxes('stallionVaccines'),
      this.mareSTDs,
      this.mareVaccines,
      this.stallionFormStatus,
      this.submitHelper,
    )
    .subscribe({
      next: () => {
        return this.stallionService.uploadNewPhotos(
          this.keptPhotos,
          this.photos,
          stallionId,
          this.stallionFormStatus,
          this.submitHelper
        )
        .subscribe({
          next: () => {
            this.stallionFormStatus['status'] = backendInteractionStatus.Success;
            this.submitHelper.setValue('Informations mises à jour avec succès.');
            this.saveButtonIsDisabled = true;
            setTimeout(() => {
              this.getBackToMyStallions();
            }, 2000)
          },
          error: () => {}
        })
      },
      error: () => {}
    })
  }

  getBackToMyStallions() {
    this.router.navigate(['/dashboard'], {queryParams: { myStallions: 'true' }});
  }
}
