import { Component } from '@angular/core';
import { updateFilterData } from './filters/filters.component'

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent {

  clickedProfileStallionId: string | null = null;

  currentFilters: updateFilterData = {
    form: {},
    breeds: {},
    colors: {},
    distance: {
      max: 0,
      lat: 0,
      lng: 0
    }
  };

  filtersAreLoading: boolean = false;

  handleNewFilters(event: any) {
    this.currentFilters = event;
    this.filtersAreLoading = true;
  }

  handleLoadingEnding(){
    this.filtersAreLoading = false;
  }

  handleClickOnProfile(itemId: string) {
    this.clickedProfileStallionId = itemId;
  }
}