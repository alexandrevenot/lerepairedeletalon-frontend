import { Component, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterNewStallionResponse, RegisterNewStallionService } from './register-new-stallion.service';
import { getAvailableBreeds, breedsRecord, availableCoverTypes, coverPlaceNames, getNumberArray, photosMaxSizeInBytes, splitListOrKeysList, balancePaymentConditions, stds, vaccines, hostingTypes } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GeolocationService, getCityData, getCityItem } from 'src/environments/geolocation';

@Component({
  selector: 'app-register-new-stallion',
  templateUrl: './register-new-stallion.component.html',
  styleUrls: ['./register-new-stallion.component.css'],
  providers: [RegisterNewStallionService, GeolocationService]
})
export class RegisterNewStallionComponent implements OnInit {
  // imported variables and functions
  public breedsRecord = breedsRecord;
  public availableBreedTypes = Object.keys(breedsRecord);
  public availableBreeds = getAvailableBreeds();
  public availableCoverTypes = availableCoverTypes;
  public coverPlaceNames = coverPlaceNames;
  public photosMaxSizeInBytes = photosMaxSizeInBytes;
  public getNumberArray = getNumberArray;
  public splitListOrKeysList = splitListOrKeysList;
  public balancePaymentConditions = balancePaymentConditions;
  public stdsRecord = stds;
  public vaccinesRecord = vaccines;
  public availableStds = Object.keys(this.stdsRecord);
  public availableVaccines = Object.keys(this.vaccinesRecord);
  public hostingTypesRecord = hostingTypes;
  public availableHostingTypes = Object.keys(this.hostingTypesRecord);

  // helpers
  public submitHelper: FormControl = new FormControl('');
  public photosHelper: FormControl= new FormControl('');
  public verificationFileHelper: FormControl= new FormControl('');
  public locationHelper: FormControl = new FormControl('');

  // form validation status
  public submitted: Record<string, boolean> = {status: false};
  public triggerEmptyMandatoryFields: Record<string, boolean> = {status: false};
  public locationSearchSuccess: Record<string, boolean> = {status: false};
  public isLookingForLocation: boolean = false;
  public locationIsValidated: boolean = false;
  public stallionHasUnregisteredBreed: boolean = false;
  public stallionHasUnregisteredProductionBreeds: boolean = false;

  // register new stallion form variables
  public coverTypes: Record<string, boolean> = {};
  public productionBreeds: Record<string, boolean> = {};
  public stallionStdNegativeTests: Record<string, boolean> = {};
  public stallionVaccines: Record<string, boolean> = {};
  public verificationFile!: File;
  public photos: File[] = [];
  public hostingTypes: Record<string, Record<string, boolean>> = {};
  public mareSTDs: Record<string, Record<string, boolean>> = {};
  public mareVaccines: Record<string, Record<string, boolean>> = {};

  // tools variables
  public photosURLs: SafeUrl[] = [];
  public locations: getCityItem[] = [];
  public locationTagValues: string[] = [];
  public selectedLocation: getCityItem = {
    city: "",
    postal_code: "",
    lat: 0,
    lng: 0
  };
  public productionBreedsAddedByHand: Array<string> = [];

  // form values variables
  public registerNewStallionForm!: FormGroup;

  constructor(
    private registerNewStallionService: RegisterNewStallionService,
    private geolocationService: GeolocationService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer
    ) {}
  
  ngOnInit(): void {  
    this.registerNewStallionForm = this.formBuilder.group({
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
      this.registerNewStallionForm.addControl(std + 'StallionTestDate', new FormControl(''));
      this.registerNewStallionForm.get(std + 'StallionTestDate')?.disable();
    }

    for (const coverType of Object.keys(this.availableCoverTypes)) {
      this.registerNewStallionForm.addControl(coverType + 'Price', new FormControl(''));
      this.registerNewStallionForm.addControl(coverType + 'BalancePaymentCondition', new FormControl(''));
      this.registerNewStallionForm.addControl(coverType + 'AdvancePercentage', new FormControl(''));

      if ('iac' === coverType) {
        this.registerNewStallionForm.addControl(coverType + 'LeftStrawsOwner', new FormControl(''));
      }

      if (['iac', 'iart'].includes(coverType)) {
        this.registerNewStallionForm.addControl(coverType + 'NbProvidedStraws', new FormControl(''));
      }

      if (['lib', 'hand', 'iai'].includes(coverType)) {
        this.registerNewStallionForm.addControl(coverType + 'CoverPlace', new FormControl(''));
        this.registerNewStallionForm.addControl(coverType + 'MaximumNumberOfAttempts', new FormControl(''));

        this.mareSTDs[coverType] = {}
        for (const std of this.availableStds) {
          this.registerNewStallionForm.addControl(coverType + std + 'MareTestOldness', new FormControl(''));
          this.registerNewStallionForm.get(coverType + std + 'MareTestOldness')?.disable();
          this.mareSTDs[coverType][std] = false;
        }

        this.hostingTypes[coverType] = {}
        for (const hostingType of this.availableHostingTypes) {
          this.registerNewStallionForm.addControl(coverType + hostingType + 'Price', new FormControl(''));
          this.registerNewStallionForm.get(coverType + hostingType + 'Price')?.disable();
          this.hostingTypes[coverType][hostingType] = false;
        }

        for (const vaccine of this.availableVaccines) {
          this.mareVaccines[coverType] = {vaccine: false};
        }
      }

      this.coverTypes[coverType] = false;
    }
  }

  // checkboxes
  updateCheckbox(checkboxType: 'productionBreeds' | 'coverTypes' | 'stallionStdNegativeTests' | 'stallionVaccines', event: any) {
    this[checkboxType][event.target.id] = event.target.checked;

    if (checkboxType === 'stallionStdNegativeTests') {
      let formControl = this.registerNewStallionForm.get(event.target.id + 'StallionTestDate')
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

  updateNestedCheckbox(coverType: string, formControlName: string, checkboxType: 'hostingTypes' | 'mareSTDs' | 'mareVaccines', event: any) {
    this[checkboxType][coverType][event.target.id] = event.target.checked;
    if (['hostingTypes', 'mareSTDs'].includes(checkboxType)) {
      let formControl = this.registerNewStallionForm.get(formControlName)
      event.target.checked? formControl?.enable(): formControl?.disable();
    }
  }

  // files
  fetchVerificationFile(event: any) {
    this.verificationFile = event.target.files[0];
    this.verificationFileHelper.setValue('');
  }

  fetchPhotos(event: any) {
    const selectedFile: File = event.target.files[0];
    if (selectedFile && selectedFile.size > photosMaxSizeInBytes) {
      this.photosHelper.setValue('La taille de chaque photo doit être inférieure à 4Mo.');
      return
    }

    this.photos.push(selectedFile);

    const img = new Image();
    img.src = URL.createObjectURL(selectedFile);

    img.onload = () => {  
      URL.revokeObjectURL(img.src);
      
      this.photosURLs.push(this.sanitizer.bypassSecurityTrustUrl(img.src));
      this.photosHelper.setValue('');
    };
  }

  deletePhoto(index: number) {
    this.photos.splice(index, 1);
    this.photosURLs.splice(index, 1);
  }

  // Stud-books
  swapStallionHasUnregisteredBreed() {
    if (!this.stallionHasUnregisteredBreed) {
      this.registerNewStallionForm.get('breed')?.setValue('');
    }
    this.stallionHasUnregisteredBreed = !this.stallionHasUnregisteredBreed;
  }

  triggerOtherProductionBreeds() {
    this.stallionHasUnregisteredProductionBreeds = true;
  }

  addAnotherProductionBreed() {
    let value: string = this.registerNewStallionForm.get('newProductionBreed')?.value;
    if (!this.productionBreedsAddedByHand.includes(value)) {
      this.productionBreedsAddedByHand.push(value);
    }
  }

  deleteAddedByHandProductionBreed(index: number) {
    this.productionBreedsAddedByHand.splice(index, 1);
  }

  // geoloc
  findCity() {
    this.isLookingForLocation = true;
    this.locations.splice(0, this.locations.length);
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.geolocationService.getCity(
      this.registerNewStallionForm.get('location')?.value,
      this.locationSearchSuccess,
      this.locationHelper)
    .subscribe((data: getCityData) => {
      for (let item of data.content) {
        this.locations.push(item);
        this.locationTagValues.push(item.city + " (" + item.postal_code + ") ?")
      }
      this.locationHelper.setValue("");
      this.locationSearchSuccess['status'] = true;
    })
  }

  resetCity() {
    this.locations.splice(0, this.locations.length);
    this.locationIsValidated = false;
    const locationControl = this.registerNewStallionForm.get('location');
    if (locationControl) {
      locationControl.setValue("");
    }
  }

  confirmLocationValue(index: number) {
    const locationControl = this.registerNewStallionForm.get('location');
    if (locationControl) {
      locationControl.setValue(this.locationTagValues[index].slice(0, -2));
    }
    this.locationHelper.setValue("");
    this.isLookingForLocation = false;
    this.selectedLocation = this.locations[index];
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.locationIsValidated = true;
  }

  // checking form validity
  isFilledInForm(field: string) {
    return this.registerNewStallionForm.getRawValue()[field];
  }

  dropdownIsSelected(field: 'breed') {
    if (field === 'breed') {
      return this.registerNewStallionForm.get('breed')?.value && (this.registerNewStallionForm.get('breed')?.value != "Sélectionner");
    } else {
      return false;
    }
  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.registerNewStallionForm.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    return invalid;
  }

  onSubmit() {
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

    if (!this.registerNewStallionForm.valid) {
      shouldThrowError = true;
    }

    // if data is not validated
    if (shouldThrowError) {
      this.triggerEmptyMandatoryFields['status'] = true;
      this.submitHelper.setValue('Une erreur est survenue. Merci de réessayer.');
      throw new Error("Incomplete form");
    }

    // API calls
    this.submitted['status'] = true;
    return this.registerNewStallionService.registerNewStallion(
      this.registerNewStallionForm.getRawValue(),
      this.selectedLocation,
      this.getSelectedCheckboxes('coverTypes'),
      this.getSelectedCheckboxes('productionBreeds').concat(this.productionBreedsAddedByHand),
      this.getSelectedCheckboxes('stallionStdNegativeTests'),
      this.getSelectedCheckboxes('stallionVaccines'),
      this.hostingTypes,
      this.mareSTDs,
      this.mareVaccines,
      this.submitted,
      this.submitHelper,
      this.triggerEmptyMandatoryFields
      ).subscribe((response: RegisterNewStallionResponse) => {
        return this.registerNewStallionService.uploadFiles(
          this.verificationFile,
          this.photos,
          response['stallion_id'],
          this.submitted,
          this.submitHelper,
          this.triggerEmptyMandatoryFields
        ).subscribe(() => {
          this.submitted['status'] = false;
          this.triggerEmptyMandatoryFields['status'] = false;
          this.submitHelper.setValue('Étalon ajouté avec succès.');
        })
      });
  }
}
