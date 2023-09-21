import { Component, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterNewStallionService } from './register-new-stallion.service';
import { getAvailableBreeds, breedsRecord, availableCoverTypes, coverPlaceNames, getNumberArray, photosMaxSizeInBytes, splitListOrKeysList, balancePaymentConditions } from 'src/environments/environment';
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

  // helpers
  public submitHelper: FormControl = new FormControl('');
  public photosHelper: FormControl= new FormControl('');
  public cSailliesHelper: FormControl= new FormControl('');
  public locationHelper: FormControl = new FormControl('');

  // form validation status
  public submitted: Record<string, boolean> = {status: false};
  public triggerEmptyMandatoryFields: Record<string, boolean> = {status: false};
  public locationSearchSuccess: Record<string, boolean> = {status: false};
  public isLookingForLocation: boolean = false;
  public locationIsValidated: boolean = false;

  // register new stallion form variables
  public coverTypes: Record<string, boolean> = {};
  public productionBreeds: Record<string, boolean> = {};
  public cSaillies!: File;
  public photos: File[] = [];

  // tools variables
  public photosURLs: SafeUrl[] = [];
  public locations: getCityItem[] = [];
  public locationTagValues: string[] = [];
  public selectedLocation: getCityItem = {
    city_name: "",
    postal_code: "",
    lat: 0,
    lng: 0
  };

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
      location: ['', Validators.required],
      postalCode: '',
    })

    for (const coverType of Object.keys(this.availableCoverTypes)) {
      this.registerNewStallionForm.addControl(coverType + 'Price', new FormControl(''));
      this.registerNewStallionForm.addControl(coverType + 'Place', new FormControl(''));
      this.registerNewStallionForm.addControl(coverType + 'SelectedBalancePaymentCondition', new FormControl(''));
      this.registerNewStallionForm.addControl(coverType + 'AdvancePercentage', new FormControl(''));
      this.registerNewStallionForm.addControl(coverType + 'SelectedLeftStrawsOwner', new FormControl(''));
      if (['iac', 'iart'].includes(coverType)) {
        this.registerNewStallionForm.get(coverType + 'Place')?.disable();
      }
      this.coverTypes[coverType] = false;
    }
  }

  // checkboxes
  updateCheckbox(checkboxType: 'productionBreeds' | 'coverTypes', event: any) {
    this[checkboxType][event.target.id] = event.target.checked;
  }

  getSelectedCheckboxes(checkboxType: 'coverTypes' | 'productionBreeds') {
    let list = [];
    for (let key of Object.keys(this[checkboxType])) {
      if (this[checkboxType][key]) {
        list.push(key);
      }
    }
    return list;
  }

  // files
  fetchCSaillies(event: any) {
    this.cSaillies = event.target.files[0];
    this.cSailliesHelper.setValue('');
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

  // geoloc
  findCity() {
    this.isLookingForLocation = true;
    this.locations.splice(0, this.locations.length);
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.geolocationService.getCity(
      this.registerNewStallionForm.get('location')?.value,
      this.registerNewStallionForm.get('postalCode')?.value,
      this.locationSearchSuccess,
      this.locationHelper)
    .subscribe((data: getCityData) => {
      for (let item of data.content) {
        this.locations.push(item);
        this.locationTagValues.push(item.city_name + " (" + item.postal_code + ") ?")
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
    console.log(this.registerNewStallionForm.getRawValue())
    // data validation
    let shouldThrowError = false;

    if (this.photos.length === 0) {
      this.photosHelper.setValue("Il faut au minimum une photo.");
      shouldThrowError = true;
    }

    if (!this.cSaillies) {
      this.cSailliesHelper.setValue("Une photo du carnet de saillies est obligatoire.");
      shouldThrowError = true;
    }

    if (!this.registerNewStallionForm.valid) {
      shouldThrowError = true;
    }

    let avCTNb = 0;
    for (const coverType of Object.keys(this.availableCoverTypes)) {
      const priceCtrl = this.registerNewStallionForm.get(coverType + 'Price');
      const placeCtrl = this.registerNewStallionForm.get(coverType + 'Place');
      if (priceCtrl && priceCtrl.value > 0) {
        avCTNb++;
        if ((!placeCtrl || !placeCtrl.value) && !['iart', 'iac'].includes(coverType)) {
          shouldThrowError = true;
        }
      }
    }
    if (avCTNb === 0) {
      shouldThrowError = true;
    }

    // if data is not validated
    if (shouldThrowError) {
      this.triggerEmptyMandatoryFields['status'] = true;
      this.submitHelper.setValue('Une erreur est survenue. Merci de réessayer.');
      throw new Error("Incomplete form");
    }

    // post request
    this.submitted['status'] = true;
    return this.registerNewStallionService.postRegisterNewStallion(
      this.registerNewStallionForm.getRawValue(),
      this.selectedLocation,
      this.cSaillies,
      this.photos,
      this.getSelectedCheckboxes('coverTypes'),
      this.getSelectedCheckboxes('productionBreeds'),
      this.submitted,
      this.submitHelper,
      this.triggerEmptyMandatoryFields
      ).subscribe(() => {
        this.submitted['status'] = false;
        this.triggerEmptyMandatoryFields['status'] = false;
        this.submitHelper.setValue('Étalon ajouté avec succès.');
      })
  }

}
