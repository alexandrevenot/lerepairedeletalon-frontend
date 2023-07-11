import { Component, OnInit, HostListener, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { StallionPanelService, searchData } from './stallion-panel.service';
import { getNumberArray } from '../../../../environments/environment';
import { updateFilterData } from '../filters/filters.component'

export interface Item {
  id: string;
  name: string;
  breed: string;
  city: string;
  postalCode: string;
  price: number;
  photoId: string;
  photo: string;
}

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
    colors: {},
    distance: {
      max: 0,
      lat: 0,
      lng: 0
    },
    coverTypes: {}
  };
  @Output() loadingEndingEvent = new EventEmitter();
  @Output() clickedOnProfileEvent = new EventEmitter();

  constructor(
    private stallionPanelService: StallionPanelService
  ) {}
  
  public getNumberArrayF = getNumberArray;

  private iteration: number = 0;
  private shouldStopCalling: boolean = false;
  public isLoading: boolean = false;

  public items: Item[] = [];
  public emptyItem = {
    id: "",
    name: "",
    breed: "",
    city: "",
    postalCode: "",
    price: 0,
    photoId: "",
    photo: ""
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
      if ( data.content.length < 16) {
        this.shouldStopCalling = true;
      }

      // infos
      for (let item of data.content) {
        this.items.push({
          id: item.id,
          name: item.name,
          breed: item.breed,
          city: item.city,
          postalCode: item.postal_code,
          price: item.price,
          photoId: item.photoId,
          photo: ""
        });

        const index: number = this.items.length - 1;

        // pp
        this.stallionPanelService.getProfilePicture(item.photoId)
        .subscribe(response => {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.items[index].photo = reader.result as string;
          };
          reader.readAsDataURL(response);
        })
      }
      this.isLoading = false;
      this.loadingEndingEvent.emit();
    })
  }
  handleClickOnProfile(itemId: string) {
    this.clickedOnProfileEvent.emit(itemId);
  }
}