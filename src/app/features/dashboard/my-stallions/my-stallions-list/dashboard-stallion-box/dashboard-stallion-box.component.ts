import { Component, Input } from '@angular/core';
import { StallionBoxItem } from '../my-stallions-list.component'

@Component({
  selector: 'app-dashboard-stallion-box',
  templateUrl: './dashboard-stallion-box.component.html',
  styleUrls: ['./dashboard-stallion-box.component.css']
})
export class DashboardStallionBoxComponent {
  @Input() item : StallionBoxItem = {
    id: null,
    name: null,
    breed: null,
    profilePicture: null
  };
}