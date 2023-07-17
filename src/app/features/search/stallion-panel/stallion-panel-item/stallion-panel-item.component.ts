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
    depName: "",
    regName: "",
    price: 0,
    photoId: "",
    photo: ""
  };
  @Output() clickedEvent = new EventEmitter();

  public location: string = "";

  ngOnInit() {
    const complete_location = this.item.city + ", " + this.item.depName + ", " + this.item.regName;
    this.location = complete_location.slice(0, 25) + '...'
  }

  handleClick(){
    this.clickedEvent.emit();
  }
}