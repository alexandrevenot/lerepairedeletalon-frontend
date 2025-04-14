import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { searchItem } from '../stallion-panel.service';
import { objectStorageBaseUrl, photosPrefix } from 'src/environments/environment';
import slug from 'slug';

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
    photo_url: "",
  };
  @Input() isFavorite: boolean = false;
  @Output() updateFavoriteStallionEvent = new EventEmitter<string>();

  public objectStorageBaseUrl = objectStorageBaseUrl;
  public photosPrefix = photosPrefix;

  public location: string = "";

  public height: string = "";

  constructor() {}

  ngOnInit() {
    this.location = (this.item.city + ", " + this.item.dep_name + ", " + this.item.reg_name).slice(0, 14) + '...';
    this.height = (this.item.height/100).toFixed(2).toString().replace(".", "m");
  }

  handleClick(){
    const url = `/etalons/${this.item.id}-${slug(this.item.name)}`;
    window.open(url, '_blank');
  }

  updateFavorite(event: any) {
    event.stopPropagation();
    if (this.item.id) {
      this.updateFavoriteStallionEvent.emit(this.item.id);
    }
  }
}