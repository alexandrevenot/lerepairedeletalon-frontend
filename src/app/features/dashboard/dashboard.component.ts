import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  selectedComponentKey: string = "";
  highlightedLabel: string = "";

  isExpandable: { [key: string]: boolean } = {
    myStallionsComponent: true,
    sellerMyCoversComponent: true
  };

  isExpanded: { [key: string]: boolean } = {
    sellerMyCoversComponent: false,
    myStallionsComponent: false
  };
  
  isHighlighted(key: string) {
    return this.highlightedLabel == key;
  }

  onClick(key: string, parentKey: string | null) {
    this.highlightedLabel = key;
    if (parentKey === null) { // label
      if (this.isExpandable[key]) {
        this.isExpanded[key] = !this.isExpanded[key];
      }
      this.selectedComponentKey = key;
    } else { // sublabel
      this.selectedComponentKey = parentKey;
    }
  }
}