import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoverNotifications, DashboardService } from './dashboard.service';
import { StallionComponentInput } from './my-stallions/stallion/stallion.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { SeoService } from 'src/app/core/seo/seo.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DashboardService]
})
export class DashboardComponent implements OnInit{

  // mapping group to name
  public mappingGroupToName: Record<any, Record<any, any>> = {
    'buyer': {
      'pendingApproval': 'Demandées',
      'pendingSignature': 'En cours de signature',
      'onGoing': 'Engagées',
      'done': 'Terminées',
      'denied': 'Refusées'
    },
    'seller': {
      'pendingApproval': 'Demandes',
      'pendingSignature': 'En cours de signature',
      'onGoing': 'Engagées',
      'done': 'Terminées',
      'denied': 'Refusées'
    }
  }

  // common variables
  public selectedComponentKey: string = "";
  public highlightedLabel: string = "";
  public selectedCategory: string = "";

  // specific variables
  public selectedCoverId: string = "";
  public pollCoverStatus: string = "";
  public selectedCoverActionType: string = "";
  public signUrl: string = "";
  public paymentPart: string = "";
  public stallionComponentInput: StallionComponentInput = {
    mode: 'creation',
    stallionId: null
  };

  public isExpandable: Record<string, Record<string, boolean>> = {
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

  public isExpanded: Record<string, Record<string, boolean>> = {
    seller: {
      MyCoversComponent: false,
      myStallionsComponent: false
    },
    buyer: {
      MyCoversComponent: false,
      myStallionsComponent: false,
    }
  };
  
  // notifications
  public coverNotifications: any = {
    buyer: null,
    seller: null
  }

  // modal
  public disconnectionModalIsActive: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private seoService: SeoService
    ) {}

  ngOnInit(): void {
    const seoData = this.route.snapshot.data;
    this.seoService.initSeo(seoData);

    this.route.queryParams.subscribe(params => {
      const coverId = params['coverId'];
      const pollCoverStatus = params['pollCoverStatus'];
      const reload = params['reload'];
      const myStallions = params['myStallions'];
      if (coverId) {
        if (['buyersigned', 'sellersigned', 'downpaid', 'fullypaid'].includes(pollCoverStatus)) {
          this.router.navigate(['/tableau-de-bord']);
          this.goToCoverPage(coverId, pollCoverStatus);
        } else {
          this.router.navigate(['/tableau-de-bord']);
          this.goToCoverPage(coverId, '');
        }
      } else if (reload != undefined) {
        this.initializeVars();
        this.router.navigate(['/tableau-de-bord']);
      } else if (myStallions != undefined) {
        this.onClick('stallionsList', 'myStallionsComponent', 'seller');
        this.router.navigate(['/tableau-de-bord']);
      } 
    });

    this.dashboardService.getCoverNotifications()
    .subscribe({
      next: (coverNotifications: CoverNotifications) => {
        this.coverNotifications = coverNotifications;
      },
      error: () => {}
    })
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

    this.acknowledgeCoverNotifications(key, category);
  }

  // special pages
  goToCoverPage(coverId: string, pollCoverStatus: '' | 'buyersigned' | 'sellersigned' | 'downpaid' | 'fullypaid') {
    this.pollCoverStatus = pollCoverStatus;
    this.selectedCoverId = coverId;
    this.selectedComponentKey = "CoverPageComponent";
  }

  goToCoverPageAction(params: {coverId: string, coverActionType: string, signUrl: string, paymentPart: string}) {
    this.selectedCoverId = params.coverId;
    this.selectedCoverActionType = params.coverActionType;
    this.signUrl = params.signUrl;
    this.paymentPart = params.paymentPart;
    this.selectedComponentKey = "CoverPageActionComponent";
  }

  goToStallionEdition(stallionId: string) {
    this.stallionComponentInput.mode = 'edition';
    this.stallionComponentInput.stallionId = stallionId;
    this.selectedComponentKey = "myStallionsComponent";
    this.highlightedLabel = 'stallion';
  }

  hasCoverNotifications(pov: 'buyer' | 'seller') {
    if (!this.coverNotifications[pov]) {return;}

    for (const value in this.coverNotifications[pov]) {
      if (this.coverNotifications[pov][value] && this.coverNotifications[pov][value].length > 0) {
        return true;
      }
    }
    return false;
  }

  sumCoverNotifications(pov: 'buyer' | 'seller') {
    if (!this.coverNotifications[pov]) {return 0;}

    let sum = 0;
    for (const value in this.coverNotifications[pov]) {
      if (this.coverNotifications[pov][value]) {
        sum += this.coverNotifications[pov][value].length;
      }
    }
    return sum;
  }

  acknowledgeCoverNotifications(group: string, pov: string) {
    if (
      ['pendingApproval', 'pendingSignature', 'onGoing', 'done', 'denied'].includes(group)
      && this.coverNotifications[pov]
      && this.coverNotifications[pov][group]
      && this.coverNotifications[pov][group].length > 0
    ) {
      this.dashboardService.acknowledgeCoverNotifications(
        this.coverNotifications[pov][group],
        pov,
        group
      )
      .subscribe({
        next: () => {
          this.coverNotifications[pov][group] = null;
        },
        error: () => {}
      });
    }
  }

  triggerDisconnectionModal() {
    this.disconnectionModalIsActive = true;
  }

  closeDisconnectionModal() {
    this.disconnectionModalIsActive = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeDisconnectionModal();
    }
  }

  disconnect() {
    this.authService.disconnectUser();
  }
}