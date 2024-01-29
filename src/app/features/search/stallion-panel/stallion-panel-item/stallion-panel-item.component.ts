import { Component, Input, OnInit } from '@angular/core';
import { FavoriteStallionsService, FavoriteStallions } from 'src/app/features/dashboard/favorite-stallions/favorite-stallions.service';
import { searchItem } from '../stallion-panel.service';
import { objectStorageBaseUrl, photosPrefix } from 'src/environments/environment';

@Component({
  selector: 'app-stallion-panel-item',
  templateUrl: './stallion-panel-item.component.html',
  styleUrls: ['./stallion-panel-item.component.css']
})
export class StallionPanelItemComponent implements OnInit{

  @Input() item: searchItem = {
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

  public objectStorageBaseUrl = objectStorageBaseUrl;
  public photosPrefix = photosPrefix;

  public location: string = "";

  public height: string = "";

  public favoriteStallions: Array<string> = [];

  constructor(
    private favoriteStallionsService: FavoriteStallionsService
  ) {}

  ngOnInit() {
    this.location = (this.item.city + ", " + this.item.dep_name + ", " + this.item.reg_name).slice(0, 14) + '...';
    this.height = (this.item.height/100).toString().replace(".", "m");
    this.loadFavoriteStallions();
  }

  handleClick(){
    const url = `/stallion-profile?id=${this.item.id}`;
    window.open(url, '_blank');
  }

  loadFavoriteStallions() {
    this.favoriteStallionsService.getFavorites()
    .subscribe((data: FavoriteStallions) => {
      this.favoriteStallions = data.favorite_stallions;
    })
  }

  updateFavorite(event: any) {
    event.stopPropagation();
    if (this.item.id) {
      if (this.favoriteStallions.includes(this.item.id)) {
        this.favoriteStallionsService.removeFromFavorites(this.item.id)
        .subscribe(() => this.loadFavoriteStallions());
      } else {
        this.favoriteStallionsService.addToFavorites(this.item.id)
        .subscribe(() => this.loadFavoriteStallions());
      }
    }
  }
}