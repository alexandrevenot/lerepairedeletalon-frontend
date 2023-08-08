import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{

  // common variables
  selectedComponentKey: string = "";
  highlightedLabel: string = "";
  selectedCategory: string = "";

  // specific variables
  selectedCoverId: string = "";
  selectedCoverActionType: string = "";

  isExpandable: Record<string, Record<string, boolean>> = {
    seller: {
      MyCoversComponent: true,
      myStallionsComponent: true
    },
    buyer: {
      MyCoversComponent: true,
      myStallionsComponent: true
    },
    parameters: {
      ProfileInformationComponent: false
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
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
    ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const coverId = params['coverId'];
      if (coverId) {
        setTimeout(() => {
          this.goToCoverPage(coverId);
          this.router.navigate(['/dashboard']);
        }, 2000)
      }
    });
  }

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

  goToCoverPageAction(params: {coverId: string, coverActionType: string}) {
    this.selectedCoverId = params.coverId;
    this.selectedCoverActionType = params.coverActionType;
    this.selectedComponentKey = "CoverPageActionComponent";
  }
}