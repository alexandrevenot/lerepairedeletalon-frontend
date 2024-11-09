import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookiesService } from 'src/app/core/cookies/cookies.service';
import { DiscountsService } from 'src/app/core/discounts/discounts.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  providers: [
    CookiesService,
    DiscountsService
  ]
})
export class FooterComponent implements OnInit {
  public cookiesAreAccepted: boolean = false;
  public firstCoverDiscountIsAcknowledged: boolean = false;

  constructor(
    private router: Router,
    private cookiesService: CookiesService,
    private discountsService: DiscountsService
  ) {}

  ngOnInit(): void {
    this.cookiesAreAccepted = this.cookiesService.cookiesAreAccepted();
    this.firstCoverDiscountIsAcknowledged = this.discountsService.firstCoverDiscountIsAcknowledged()
  }

  acknowledgeFirstCoverDiscount() {
    this.discountsService.acknowledgeFirstCoverDiscount();
    this.firstCoverDiscountIsAcknowledged = true;
  }

  acceptCookies() {
    this.cookiesService.acceptCookies();
    this.cookiesAreAccepted = true;
  }

  navigateTo(path: string) {
    this.router.navigate([`/${path}`]).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
