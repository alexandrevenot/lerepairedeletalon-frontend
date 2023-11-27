import { Component, Input, OnInit } from '@angular/core';
import { Item } from '../stallion-panel.component'
import { FavoriteStallionsService, FavoriteStallions } from 'src/app/features/dashboard/favorite-stallions/favorite-stallions.service';

@Component({
  selector: 'app-stallion-panel-item',
  templateUrl: './stallion-panel-item.component.html',
  styleUrls: ['./stallion-panel-item.component.css']
})
export class StallionPanelItemComponent implements OnInit{

  @Input() item: Item = {
    id: "",
    name: "",
    breed: "",
    city: "",
    depName: "",
    regName: "",
    price: 0,
    photoId: "",
    photo: ""
  };

  public location: string = "";
  public favoriteStallions: Array<string> = [];

  constructor(
    private favoriteStallionsService: FavoriteStallionsService
  ) {}

  ngOnInit() {
    this.location = (this.item.city + ", " + this.item.depName + ", " + this.item.regName).slice(0, 14) + '...';
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