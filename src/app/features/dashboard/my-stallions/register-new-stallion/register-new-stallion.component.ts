import { Component, EventEmitter, Output, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterNewStallionService, getCityData, getCityItem } from './register-new-stallion.service';
import { availableBreeds, availableColors, getNumberArray, photosMaxSizeInBytes } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-register-new-stallion',
  templateUrl: './register-new-stallion.component.html',
  styleUrls: ['./register-new-stallion.component.css'],
  providers: [RegisterNewStallionService]
})
export class RegisterNewStallionComponent implements OnInit {
  // imported variables and functions
  public availableBreeds = availableBreeds;
  public availableColors = availableColors;
  public photosMaxSizeInBytes = photosMaxSizeInBytes;
  public getNumberArray = getNumberArray;

  // utility variables
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
  public rTypes!: { [key: string]: boolean };

  constructor(
    private registerNewStallionService: RegisterNewStallionService,
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
      mainDesc: [''],
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
      comments: [''],
      price: ['', Validators.required],
      location: ['', Validators.required],
      postalCode: ['', Validators.required]
    })
  
    this.breed = "Sélectionner";
    this.rTypes = {
      lib: false,
      iai: false,
      iarp: false,
      iac: false,
      iate: false,
      icsi: false
    }
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
    this.rTypes[event.target.id] = event.target.checked;
  }

  // utility functions on form values fetching
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
    this.registerNewStallionService.getCity(
      this.registerNewStallionForm.getRawValue().location,
      this.locationSearchSuccess,
      this.locationMessage)
    .subscribe((data: getCityData) => {
      if (data.content.length <= 10) {
        for (let item of data.content) {
          this.locations.push(item);
          this.locationTagValues.push(item.city_name + " (" + item.postal_code + ") ?")
        }
        this.locationMessage.setValue("");
        this.locationSearchSuccess['status'] = true;
      } else {
        this.locationMessage.setValue("Il existe au moins " + data.content.length.toString() + " code postaux valides pour cette entrée. Veuillez ajouter au moins les premiers chiffres du code postal.");
        this.locationSearchSuccess['status'] = false;
      }
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

  // final submit function
  onSubmit() {
    this.submitted['status'] = true;

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

    if (shouldThrowError) {
      throwError(() => new Error());
    }

    // post request
    this.registerNewStallionService.postRegisterNewStallion(
      this.registerNewStallionForm.getRawValue(),
      this.breed,
      this.color,
      this.cSaillies,
      this.photos,
      this.rTypes,
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
