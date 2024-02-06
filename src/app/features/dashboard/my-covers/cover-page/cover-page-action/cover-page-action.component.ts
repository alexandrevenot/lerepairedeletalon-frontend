import { Component, Input, OnInit } from '@angular/core';
import { CoverPageActionService, GetCheckout, GetSignUrl } from './cover-page-action.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cover-page-action',
  templateUrl: './cover-page-action.component.html',
  styleUrls: ['./cover-page-action.component.css'],
  providers: [CoverPageActionService]
})
export class CoverPageActionComponent implements OnInit{
  @Input() coverId: string = "";
  @Input() coverActionType: string = "";

  // signature data
  public iframe_url: SafeUrl = "";
  public nativeHeight = window.screen.height;

  // payment data
  public subtotal: number = 0;
  public serviceFees: number = 0;
  public total: number = 0;

  public statusToTitle: Record<string, string> = {
    sellersigned: "Paiement de l'acompte de la saillie",
    downpaid: "Paiement du solde de la saillie"
  }

  public paymentTitle: string = "Paiement de la saillie";

  constructor(
    private coverPageActionService: CoverPageActionService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (this.coverActionType == "signature") {
      this.coverPageActionService.getSignUrl(this.coverId)
      .subscribe({
        next: (data: GetSignUrl) => {
          this.iframe_url = this.sanitizer.bypassSecurityTrustResourceUrl(data.url);
        },
        error: () => {}
      })
    } else if (this.coverActionType == "payment") {
      this.coverPageActionService.getCheckout(this.coverId)
      .subscribe({
        next: (data: GetCheckout) => {
          this.subtotal = data.subtotal;
          this.serviceFees = data.service_fees;
          this.total = data.total;
          this.paymentTitle = this.statusToTitle[data.status];
        },
        error: () => {}
      })
    }

  }

  pay() {
    this.coverPageActionService.stepForwardPayment(this.coverId)
    .subscribe({
      next: () => {
        this.router.navigate(
          ['/dashboard'],
          { queryParams: { coverId: this.coverId } }
          );
      },
      error: () => {}
    })
  }
}
