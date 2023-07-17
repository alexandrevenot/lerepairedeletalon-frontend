import { Component, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterNewStallionService } from './register-new-stallion.service';
import { availableBreeds, availableColors, availableCoverTypes, getNumberArray, photosMaxSizeInBytes } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { throwError } from 'rxjs';
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
  public photosMaxSizeInBytes = photosMaxSizeInBytes;
  public getNumberArray = getNumberArray;

  // utility variables
  public coverTypes: {[key: string]: boolean} = {};
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

    for (const coverType of this.objectKeys(this.availableCoverTypes, 'all')) {
      this.registerNewStallionForm.addControl(coverType + 'Price', new FormControl(''))
    }
    
    for (const key in availableCoverTypes) {
      this.coverTypes[key] = false;
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

  updateRType(event: any) {
    this.coverTypes[event.target.id] = event.target.checked;
  }

  // utility functions on form values fetching
  objectKeys(obj: Record<string, any>, part: 'first' | 'last' | 'all'): string[] {
    if (part === 'first') {
      return Object.keys(obj).slice(0, Math.ceil(Object.keys(obj).length / 2));
    } else if (part === 'last') {
      return Object.keys(obj).slice(Math.ceil(Object.keys(obj).length / 2), Object.keys(obj).length);
    } else {
      return Object.keys(obj).slice(0, Object.keys(obj).length);
    }
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
    for (const coverType of this.objectKeys(this.availableCoverTypes, 'all')) {
      const priceCtrl = this.registerNewStallionForm.get(coverType + 'Price')
      if (priceCtrl && priceCtrl.value > 0) {
        avCTNb++;
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
    return this.registerNewStallionService.postRegisterNewStallion(
      this.registerNewStallionForm.getRawValue(),
      this.selectedLocation,
      this.breed,
      this.color,
      this.cSaillies,
      this.photos,
      this.coverTypes,
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
