import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Item } from '../stallion-panel.component'

@Component({
  selector: 'app-stallion-panel-item',
  templateUrl: './stallion-panel-item.component.html',
  styleUrls: ['./stallion-panel-item.component.css']
})
export class StallionPanelItemComponent {

  @Input() item!: Item;
  @Output() clickedEvent = new EventEmitter();

  handleClick(){
    this.clickedEvent.emit();
  }
}