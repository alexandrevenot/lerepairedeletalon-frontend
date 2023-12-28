import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StallionComponentInput } from './my-stallions/stallion/stallion.component';

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
  stallionComponentInput: StallionComponentInput = {
    mode: 'creation',
    stallionId: null
  };

  isExpandable: Record<string, Record<string, boolean>> = {
    seller: {
      MyCoversComponent: true,
      myStallionsComponent: true
    },
    buyer: {
      MyCoversComponent: true,
      myStallionsComponent: true,
      myFavorites: false
    },
    admin: {
      MyAccountComponent: false
    }
  };

  isExpanded: Record<string, Record<string, boolean>> = {
    seller: {
      MyCoversComponent: false,
      myStallionsComponent: false
    },
    buyer: {
      MyCoversComponent: false,
      myStallionsComponent: false,
    }
  };
  
  constructor(
    private route: ActivatedRoute,
    private router: Router
    ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const coverId = params['coverId'];
      const reload = params['reload'];
      const myStallions = params['myStallions'];
      if (coverId != undefined) {
        if (coverId) {
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
            this.goToCoverPage(coverId);
          }, 2000)
        }
      } else if (reload != undefined) {
        this.initializeVars();
        this.router.navigate(['/dashboard']);
      } else if (myStallions != undefined) {
        this.onClick('stallionsList', 'myStallionsComponent', 'seller');
        this.router.navigate(['/dashboard']);
      } 
    });
  }

  initializeVars() {
    this.selectedComponentKey= "";
    this.highlightedLabel= "";
    this.selectedCategory= "";
    this.isExpanded = {
      seller: {
        MyCoversComponent: false,
        myStallionsComponent: false
      },
      buyer: {
        MyCoversComponent: false,
        myStallionsComponent: false
      }
    };

    this.stallionComponentInput.mode = 'creation';
    this.stallionComponentInput.stallionId = null;
  }

  isHighlighted(key: string, category: string) {
    return this.highlightedLabel == key && this.selectedCategory == category;
  }

  onClick(key: string, parentKey: string | null, category: string) {
    // special cases
    if (this.highlightedLabel === 'stallion') {
      this.stallionComponentInput.mode = 'creation';
      this.stallionComponentInput.stallionId = null;
    }

    // main behavior
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

  goToStallionEdition(stallionId: string) {
    this.stallionComponentInput.mode = 'edition';
    this.stallionComponentInput.stallionId = stallionId;
    this.selectedComponentKey = "myStallionsComponent";
    this.highlightedLabel = 'stallion';
  }
}