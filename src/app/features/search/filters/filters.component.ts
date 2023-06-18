import { Component, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { availableBreeds, availableColors, getNumberArray } from '../../../../environments/environment';

export interface updateFilterData {
  form: { [key: string]: string | null },
  breeds: { [key: string]: boolean },
  colors: { [key: string]: boolean }
}

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.css']
})
export class FiltersComponent {

  @Input() loadingStatus: boolean = false;
  @Output() updateFiltersEvent = new EventEmitter<updateFilterData>();

  // imports
  availableBreeds = availableBreeds;
  availableColors = availableColors;
  public getNumberArrayF = getNumberArray;

  // user input
  filterForm = new FormGroup({
    lowest_price: new FormControl(''),
    highest_price: new FormControl(''),
  });

  selectedBreeds: { [key: string]: boolean } = {};
  selectedColors: { [key: string]: boolean } = {};

  constructor() {
    this.availableBreeds.forEach((elt) => {
      this.selectedBreeds[elt] = false;
    })

    this.availableColors.forEach((elt) => {
      this.selectedColors[elt] = false;
    })
  }

  // interactions
  filterIsSelected: { [key: string]: boolean } = {
    'breed': false,
    'color': false,
    'price': false,
  }

  swapFilter(field: string) {
    this.filterIsSelected[field] = !this.filterIsSelected[field] 
  }

  updateCheckbox(type: 'color' | 'breed', event: any) {
    if (type == 'color') {
      this.selectedColors[event.target.id] = event.target.checked;
    } else {
      this.selectedBreeds[event.target.id] = event.target.checked;
    }
  }

  onSubmit() {
    this.updateFiltersEvent.emit({
      form: this.filterForm.getRawValue(),
      breeds: this.selectedBreeds,
      colors: this.selectedColors
    });
  }
}
