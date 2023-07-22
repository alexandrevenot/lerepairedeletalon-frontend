import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  // common variables
  selectedComponentKey: string = "";
  highlightedLabel: string = "";
  selectedCategory: string = "";

  // specific variables
  selectedCoverId: string = "";

  isExpandable: Record<string, Record<string, boolean>> = {
    seller: {
      MyCoversComponent: true,
      myStallionsComponent: true
    },
    buyer: {
      MyCoversComponent: true,
      myStallionsComponent: true
    }
  };

  isExpanded: Record<string, Record<string, boolean>> = {
    seller: {
      MyCoversComponent: false,
      myStallionsComponent: false
    },
    buyer: {
      MyCoversComponent: false,
      myStallionsComponent: false
    }
  };
  
  isHighlighted(key: string, category: string) {
    return this.highlightedLabel == key && this.selectedCategory == category;
  }

  onClick(key: string, parentKey: string | null, category: string) {
    this.selectedCategory = category;
    this.highlightedLabel = key;
    if (parentKey === null) { // label
      if (this.isExpandable[category][key]) {
        this.isExpanded[category][key] = !this.isExpanded[category][key];
      }
      this.selectedComponentKey = key;
    } else { // sublabel
      this.selectedComponentKey = parentKey;
    }
  }

  // special pages
  goToCoverPage(coverId: string) {
    this.selectedCoverId = coverId;
    this.selectedComponentKey = "CoverPageComponent";
  }
}