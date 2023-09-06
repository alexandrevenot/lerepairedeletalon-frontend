import { Component, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterNewStallionService } from './register-new-stallion.service';
import { availableBreeds, availableColors, availableCoverTypes, coverPlaceNames, getNumberArray, photosMaxSizeInBytes } from 'src/environments/environment';
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
  public availableBreeds = availableBreeds;
  public availableColors = availableColors;
  public availableCoverTypes = availableCoverTypes;
  public coverPlaceNames = coverPlaceNames;
  public photosMaxSizeInBytes = photosMaxSizeInBytes;
  public getNumberArray = getNumberArray;

  // utility variables
  public coverTypes: {[key: string]: boolean} = {};
  public coverTypesForWhichCenterIsNotFilled: Record<string, boolean> = {};
  public submitted!: {[key: string]: boolean};
  public registerMessage!: FormControl;
  public photosMessage!: FormControl;
  public cSailliesMessage!: FormControl;
  public triggerEmptyMandatoryFields: {[key: string]: boolean} = {status: false};
  public locations: getCityItem[] = [];
  public locationTagValues: string[] = [];
  public isLookingForLocation: boolean = false;
  public locationSearchSuccess: {[key: string]: boolean} = {status: false};
  public locationMessage!: FormControl;
  public locationIsValidated: boolean = false;
  public selectedLocation: getCityItem = {
    city_name: "",
    postal_code: "",
    lat: 0,
    lng: 0
  };
  public productionBreeds: {[key: string]: boolean} = {};

  // form values variables
  public registerNewStallionForm!: FormGroup;
  public breed!: string;
  public color!: string;
  public cSaillies!: File;
  public photos: File[] = [];
  public photosURLs: SafeUrl[] = [];

  constructor(
    private registerNewStallionService: RegisterNewStallionService,
    private geolocationService: GeolocationService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer
    ) {}
  
  ngOnInit(): void {
    // utility variables init
    this.submitted = {status: false};
    this.registerMessage = new FormControl('');
    this.photosMessage = new FormControl('');
    this.cSailliesMessage = new FormControl('');
    this.locationMessage = new FormControl('');
  
    // form values variables init
    this.registerNewStallionForm = this.formBuilder.group({
      name: ['', Validators.required],
      nSIRE: ['', Validators.required],
      mainDesc: ['', Validators.required],
      birthdate: ['', Validators.required],
      height: ['', Validators.required],
      offspring: [''],
      performance: [''],
      p1: [''],
      p2: [''],
      p3: [''],
      p4: [''],
      p5: [''],
      p6: [''],
      p7: [''],
      p8: [''],
      p9: [''],
      p10: [''],
      p11: [''],
      p12: [''],
      p13: [''],
      p14: [''],
      pedigreePO: [''],
      stallionAdditionalInfo: [''],
      location: ['', Validators.required],
      postalCode: [''],
      coverAdditionalInfo: ['', Validators.required]
    })

    for (const coverType of this.objectKeys(this.availableCoverTypes, 'obj', 1)[0]) {
      this.registerNewStallionForm.addControl(coverType + 'Price', new FormControl({value: '', disabled: false}));
      this.registerNewStallionForm.addControl(coverType + 'Place', new FormControl(''));
    }
    
    for (const key in availableCoverTypes) {
      this.coverTypes[key] = false;
      this.coverTypesForWhichCenterIsNotFilled[key] = false;
    }

    for (const key in availableBreeds) {
      this.productionBreeds[key] = false;
    }

    this.breed = "Sélectionner";
    this.color = "Sélectionner";
  }

  // fetching form values
  updateSelect(type: 'color' | 'breed', event: any) {
    this[type] = event.target.value;
  }

  fetchCSaillies(event: any) {
    this.cSaillies = event.target.files[0];
    this.cSailliesMessage.setValue("");
  }

  fetchPhotos(event: any) {
    const selectedFile: File = event.target.files[0];
    if (selectedFile && selectedFile.size > photosMaxSizeInBytes) {
      this.photosMessage.setValue('La taille de chaque photo doit être inférieure à 4Mo.');
      return
    }

    this.photos.push(selectedFile);

    const img = new Image();
    img.src = URL.createObjectURL(selectedFile);

    img.onload = () => {
      const width: number = img.width;
      const height: number = img.height;
  
      URL.revokeObjectURL(img.src);
      
      this.photosURLs.push(this.sanitizer.bypassSecurityTrustUrl(img.src));
      let value = this.photosMessage.value;
      if (value != "") {
        this.photosMessage.setValue('');
      }
    };
  }

  deletePhoto(index: number) {
    this.photos.splice(index, 1);
    this.photosURLs.splice(index, 1);
  }

  updateProductionBreeds(event: any) {
    this.productionBreeds[event.target.id] = event.target.checked;
  }

  updateRType(event: any) {
    this.coverTypes[event.target.id] = event.target.checked;
  }

  updateCoverTypesForWhichCenterIsNotFilled(event: any) {
    this.coverTypesForWhichCenterIsNotFilled[event.target.id] = event.target.checked;
    if (event.target.checked) {
      this.registerNewStallionForm.get(event.target.id + 'Place')?.disable();
    } else {
      this.registerNewStallionForm.get(event.target.id + 'Place')?.enable();
    }
  }

  objectKeys(variable: Record<string, any> | Array<string>, varType: 'obj' | 'list', number_of_columns: number): Array<Array<string>> {
    let columns = []

    if (varType == 'obj') {
      variable = Object.keys(variable);
    }

    if (number_of_columns === 1) {
      columns.push(variable.slice(0, variable.length));
      return columns;
    }

    columns.push(variable.slice(0, Math.ceil(variable.length / number_of_columns)))

    if (number_of_columns > 2) {
      for (let i = 1; i < number_of_columns - 1; i++) {
        columns.push(variable.slice(Math.ceil((variable.length / number_of_columns)*i), Math.ceil((variable.length / number_of_columns)*(i+1))))
      }
    }

    columns.push(variable.slice(variable.length - Math.ceil(variable.length / number_of_columns), variable.length))

    return columns;
  }

  getSelectedProductionBreeds() {
    let list = [];
    for (let key of Object.keys(this.productionBreeds)) {
      if (this.productionBreeds[key]) {
        list.push(key);
      }
    }
    return list;
  }

  getSelectedRTypes() {
    let list = [];
    for (let key of Object.keys(this.coverTypes)) {
      if (this.coverTypes[key]) {
        list.push(key);
      }
    }
    return list;
  }

  isFilledInForm(field: string) {
    return this.registerNewStallionForm.getRawValue()[field];
  }

  dropdownIsSelected(field: 'breed' | 'color') {
    if (field === 'breed') {
      return this.breed != "Sélectionner";
    } else {
      return this.color != "Sélectionner";
    }
  }

  // geoloc
  findCity() {
    this.isLookingForLocation = true;
    this.locations.splice(0, this.locations.length);
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.geolocationService.getCity(
      this.registerNewStallionForm.getRawValue().location,
      this.registerNewStallionForm.getRawValue().postalCode,
      this.locationSearchSuccess,
      this.locationMessage)
    .subscribe((data: getCityData) => {
      for (let item of data.content) {
        this.locations.push(item);
        this.locationTagValues.push(item.city_name + " (" + item.postal_code + ") ?")
      }
      this.locationMessage.setValue("");
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
    this.locationMessage.setValue("");
    this.isLookingForLocation = false;
    this.selectedLocation = this.locations[index];
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.locationIsValidated = true;
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

  // final submit function
  onSubmit() {
    // data validation
    let shouldThrowError = false;

    if (this.photos.length === 0) {
      this.photosMessage.setValue("Il faut au minimum une photo.");
      shouldThrowError = true;
    }

    if (!this.cSaillies) {
      this.cSailliesMessage.setValue("Une photo du carnet de saillies est obligatoire.");
      shouldThrowError = true;
    }

    if (!this.registerNewStallionForm.valid) {
      shouldThrowError = true;
    }

    let avCTNb = 0;
    for (const coverType of this.objectKeys(this.availableCoverTypes, 'obj', 1)[0]) {
      const priceCtrl = this.registerNewStallionForm.get(coverType + 'Price');
      const placeCtrl = this.registerNewStallionForm.get(coverType + 'Place');
      if (priceCtrl && priceCtrl.value > 0) {
        avCTNb++;
        if ((!placeCtrl || !placeCtrl.value) && !this.coverTypesForWhichCenterIsNotFilled[coverType]) {
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
      this.registerMessage.setValue('Une erreur est survenue. Merci de réessayer.');
      throw new Error("Incomplete form");
    }

    // post request
    this.submitted['status'] = true;
    console.log(this.registerNewStallionForm.getRawValue());
    return this.registerNewStallionService.postRegisterNewStallion(
      this.registerNewStallionForm.getRawValue(),
      this.selectedLocation,
      this.breed,
      this.color,
      this.cSaillies,
      this.photos,
      this.getSelectedRTypes(),
      this.getSelectedProductionBreeds(),
      this.submitted,
      this.registerMessage,
      this.triggerEmptyMandatoryFields
      ).subscribe(() => {
        this.submitted['status'] = false;
        this.triggerEmptyMandatoryFields['status'] = false;
        this.registerMessage.setValue('Étalon ajouté avec succès.');
      })
  }

}
