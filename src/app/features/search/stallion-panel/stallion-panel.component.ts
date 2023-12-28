import { Component, OnInit, HostListener, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { StallionPanelService, searchData, searchItem } from './stallion-panel.service';
import { updateFilterData } from '../filters/filters.component'
import { getNumberArray } from 'src/environments/environment';

@Component({
  selector: 'app-stallion-panel',
  templateUrl: './stallion-panel.component.html',
  styleUrls: ['./stallion-panel.component.css'],
  providers: [StallionPanelService]
})
export class StallionPanelComponent implements OnInit, OnChanges {
  @Input() filters: updateFilterData = {
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
  @Output() loadingEndingEvent = new EventEmitter();

  constructor(
    private stallionPanelService: StallionPanelService
  ) {}
  
  public getNumberArrayF = getNumberArray;

  private iteration: number = 0;
  private shouldStopCalling: boolean = false;
  public isLoading: boolean = false;

  public items: searchItem[] = [];
  public emptyItem: searchItem = {
    id: "",
    name: "",
    breed: "",
    height: 0,
    cover_types: [],
    city: "",
    dep_name: "",
    reg_name: "",
    price: 0,
    photo_url: ""
  };

  ngOnInit() {
    this.loadProfiles();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['filters']) {    
      this.items.splice(0, this.items.length);
      this.iteration = 0;
      this.shouldStopCalling = false;
      this.loadProfiles();
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll() {
    if (this.shouldLoadMoreProfiles()) {
      if ( !this.shouldStopCalling ) {
        this.isLoading = true;
        this.loadProfiles();
      }
    }
  }

  shouldLoadMoreProfiles(): boolean {
    return (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10;
  }

  loadProfiles() {
    this.stallionPanelService.getSearch(16, ++this.iteration, this.filters)
    .subscribe((data: searchData) => {
      if (data.content.length < 16) {
        this.shouldStopCalling = true;
      }
      this.items.push(...data.content);
      this.isLoading = false;
      this.loadingEndingEvent.emit();
    })
  }
}