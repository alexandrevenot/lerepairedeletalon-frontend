import { Component } from '@angular/core';
import { MyStallionsComponent } from './my-stallions/my-stallions.component';
import { SellerMyCoversComponent } from './seller-my-covers/seller-my-covers.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  selectedComponentKey: string = "";
  highlightedLabel: string = "";

  isExpandable: { [key: string]: boolean } = {
    myStallionsComponent: false,
    sellerMyCoversComponent: true
  };

  isExpanded: { [key: string]: boolean } = {
    sellerMyCoversComponent: false
  };
  
  isHighlighted(key: string) {
    return this.highlightedLabel == key;
  }

  onClick(key: string, parentKey: string | null) {
    this.highlightedLabel = key;
    if (parentKey === null) { // label
      if (this.isExpandable[key]) {
        this.isExpanded[key] = !this.isExpanded[key];
      } else {
        this.selectedComponentKey = key;
      }
    } else { // sublabel
      this.selectedComponentKey = parentKey;
    }
  }
}