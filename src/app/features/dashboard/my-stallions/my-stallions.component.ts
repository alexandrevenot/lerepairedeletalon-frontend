import { Component } from '@angular/core';

@Component({
  selector: 'app-my-stallions',
  templateUrl: './my-stallions.component.html',
  styleUrls: ['./my-stallions.component.css']
})
export class MyStallionsComponent {

  action : string = "view";

  addNewStallion() {
    this.action = "add"
  }

  returnToStallionList() {
    this.action = "view"
  }
}