import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Item } from '../stallion-panel.component'

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
    postalCode: "",
    price: 0,
    photoId: "",
    photo: ""
  };
  @Output() clickedEvent = new EventEmitter();

  public location: string = "";

  ngOnInit() {
    this.location = this.item.city + " (" + this.item.postalCode.slice(0, 2) + ")"
  }

  handleClick(){
    this.clickedEvent.emit();
  }
}