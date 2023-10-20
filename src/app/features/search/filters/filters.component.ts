import { Component, Input, EventEmitter, Output, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { breedsRecord, getAvailableBreeds, availableCoverTypes, getNumberArray } from '../../../../environments/environment';
import { GeolocationService, getCityData, getCityItem } from 'src/environments/geolocation';

interface distanceData {
  max: number,
  lat: number,
  lng: number
}

export interface updateFilterData {
  form: { [key: string]: string | null },
  breeds: { [key: string]: boolean },
  productionBreeds: Record<string, boolean>,
  distance: distanceData,
  coverTypes: { [key: string]: boolean }
}

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css'],
  providers: [GeolocationService]
})
export class FiltersComponent implements OnInit {

  @Input() loadingStatus: boolean = false;
  @Output() updateFiltersEvent = new EventEmitter<updateFilterData>();

  // imports
  breedsRecord = breedsRecord;
  availableBreedTypes = Object.keys(breedsRecord);
  availableBreeds = getAvailableBreeds();
  availableCoverTypes = availableCoverTypes;
  public getNumberArrayF = getNumberArray;

  public filterForm!: FormGroup;

  selectedBreeds: { [key: string]: boolean } = {};
  selectedProductionBreeds: Record<string, boolean> = {};
  selectedCoverTypes: { [key: string]: boolean } = {};
  availableCoverTypesL: string[] = [];

  distance: distanceData = {
    max: 0,
    lat: 0,
    lng: 0
  };
  public distanceControl!: FormControl;

  public locations: getCityItem[] = [];
  public locationIsValidated: boolean = false;
  public locationTagValues: string[] = [];
  public locationMessage: FormControl = new FormControl('');
  public isLookingForLocation: boolean = false;
  public locationSearchSuccess: {[key: string]: boolean} = {status: false};
  public selectedLocation: getCityItem = {
    city: "",
    postal_code: "",
    lat: 0,
    lng: 0
  };

  filterIsSelected: { [key: string]: boolean } = {
    'breed': false,
    'productionBreed': false,
    'height': false,
    'price': false,
    'distance': false,
    'coverType': false
  }

  constructor(
    private geolocationService: GeolocationService,
    private formBuilder: FormBuilder
    ) {
    this.availableBreeds.forEach((elt) => {
      this.selectedBreeds[elt] = false;
    })

    this.availableBreeds.forEach((elt) => {
      this.selectedProductionBreeds[elt] = false;
    })

    Object.keys(this.availableCoverTypes).forEach((elt) => {
      this.availableCoverTypesL.push(elt);
      this.selectedCoverTypes[elt] = false;
    });
  }

  ngOnInit(): void {
    this.filterForm = this.formBuilder.group({
      lowestPrice: [''],
      highestPrice: [''],
      lowestHeight: [''],
      highestHeight: [''],
      location: ['']
    });
    
    this.distanceControl = new FormControl('');
  }

  swapFilter(field: string) {
    this.filterIsSelected[field] = !this.filterIsSelected[field] 
  }

  updateCheckbox(type: 'breed' | 'coverType' | 'productionBreed', event: any) {
    if (type == 'breed') {
      this.selectedBreeds[event.target.id] = event.target.checked;
    } else if (type == 'productionBreed') {
      this.selectedProductionBreeds[event.target.id] = event.target.checked;
    } else {
      this.selectedCoverTypes[event.target.id] = event.target.checked;
    }
  }

  // geolocation
  findCity() {
    this.isLookingForLocation = true;
    this.locations.splice(0, this.locations.length);
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.geolocationService.getCity(
      this.filterForm.getRawValue().location,
      this.locationSearchSuccess,
      this.locationMessage)
    .subscribe((data: getCityData) => {
      for (let item of data.content) {
        this.locations.push(item);
        this.locationTagValues.push(item.city + " (" + item.postal_code + ") ?")
      }
      this.locationMessage.setValue("");
      this.locationSearchSuccess['status'] = true;
    })
  }

  resetCity() {
    this.locations.splice(0, this.locations.length);
    this.locationIsValidated = false;
    const locationControl = this.filterForm.get('location');
    if (locationControl) {
      locationControl.setValue("");
    }
  }

  confirmLocationValue(index: number) {
    const locationControl = this.filterForm.get('location');
    if (locationControl) {
      locationControl.setValue(this.locationTagValues[index].slice(0, -2));
    }
    this.locationMessage.setValue("");
    this.isLookingForLocation = false;
    this.selectedLocation = this.locations[index];
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.locationIsValidated = true;
  }

  resetFilters() {
    this.availableBreeds.forEach((elt) => {
      this.selectedBreeds[elt] = false;
    });
  
    this.availableBreeds.forEach((elt) => {
      this.selectedProductionBreeds[elt] = false;
    });

    this.resetCity();

    const lowestPriceControl = this.filterForm.get('lowestPrice');
    if (lowestPriceControl) {
      lowestPriceControl.setValue("");
    }

    const highestPriceControl = this.filterForm.get('highestPrice');
    if (highestPriceControl) {
      highestPriceControl.setValue("");
    }

    const lowestHeightControl = this.filterForm.get('lowestHeight');
    if (lowestHeightControl) {
      lowestHeightControl.setValue("");
    }

    const highestHeightControl = this.filterForm.get('highestHeight');
    if (highestHeightControl) {
      highestHeightControl.setValue("");
    }

    this.distanceControl.setValue("");

    Object.keys(this.availableCoverTypes).forEach((elt) => {
      this.selectedCoverTypes[elt] = false;
    });

    this.onSubmit()
  }

  onSubmit() {
    if (this.distanceControl.getRawValue() && this.locationIsValidated) {
      this.distance.max = Number(this.distanceControl.getRawValue());
      this.distance.lat = this.selectedLocation.lat;
      this.distance.lng = this.selectedLocation.lng;
    } else {
      this.distance.max = 0;
      this.distance.lat = 0;
      this.distance.lng = 0;
    }

    this.updateFiltersEvent.emit({
      form: this.filterForm.getRawValue(),
      breeds: this.selectedBreeds,
      productionBreeds: this.selectedProductionBreeds,
      distance: this.distance,
      coverTypes: this.selectedCoverTypes
    });
  }
}