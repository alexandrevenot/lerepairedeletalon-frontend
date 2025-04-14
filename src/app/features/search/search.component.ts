import { Component, OnInit } from '@angular/core';
import { updateFilterData } from './filters/filters.component'
import { ActivatedRoute } from '@angular/router';
import { SeoService } from 'src/app/core/seo/seo.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit{

  currentFilters: updateFilterData = {
    form: {},
    breeds: {},
    productionBreeds: {},
    distance: {
      max: 0,
      lat: 0,
      lng: 0
    },
    coverTypes: {}
  };

  filtersAreLoading: boolean = false;

  constructor(private route: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit(): void {
    const seoData = this.route.snapshot.data;
    this.seoService.initSeo(seoData);
  }

  handleNewFilters(event: any) {
    this.currentFilters = event;
    this.filtersAreLoading = true;
  }

  handleLoadingEnding(){
    this.filtersAreLoading = false;
  }
}