import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CoverPageActionService, GetCheckout, GetSignUrl } from './cover-page-action.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Stripe, StripeEmbeddedCheckout, loadStripe } from '@stripe/stripe-js';
import { stripePK } from 'src/environments/environment';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cover-page-action',
  templateUrl: './cover-page-action.component.html',
  styleUrls: ['./cover-page-action.component.css'],
  providers: [CoverPageActionService]
})
export class CoverPageActionComponent implements OnInit, OnDestroy {
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
  public stripe: Stripe | null = null;
  public checkout: StripeEmbeddedCheckout | undefined;

  constructor(
    private coverPageActionService: CoverPageActionService,
    private sanitizer: DomSanitizer,
    private router: Router
  ) {}

  async ngOnInit() {
    if (this.coverActionType == "signature") {
      this.coverPageActionService.getSignUrl(this.coverId)
      .subscribe({
        next: (data: GetSignUrl) => {
          this.iframe_url = this.sanitizer.bypassSecurityTrustResourceUrl(data.url);
        },
        error: () => {}
      })
    } else if (this.coverActionType == "payment") {
      try {
        this.stripe = await loadStripe(stripePK);
      } catch {
        return
      }

      const fetchClientSecret = async () => {
        const response = await firstValueFrom(this.coverPageActionService.getCheckout(this.coverId));
        return response.client_secret;
      }

      this.checkout = await this.stripe?.initEmbeddedCheckout({fetchClientSecret});
      this.checkout?.mount('#checkout');
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

  async ngOnDestroy() {
    this.checkout?.unmount();
    this.checkout?.destroy();
  }
}
