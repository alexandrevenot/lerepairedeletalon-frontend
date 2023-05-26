import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-my-stallions-list',
  templateUrl: './my-stallions-list.component.html',
  styleUrls: ['./my-stallions-list.component.css']
})
export class MyStallionsListComponent {

  @Output() addNewStallionEE = new EventEmitter();

  addNewStallion() {
    this.addNewStallionEE.emit();
  }
  
}
