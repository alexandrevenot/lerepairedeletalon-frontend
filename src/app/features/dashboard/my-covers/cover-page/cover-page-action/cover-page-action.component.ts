import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CoverPageActionService } from './cover-page-action.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
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
  @Input() signUrl: string = "";
  @Input() paymentPart: string = "";

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
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    if (this.coverActionType == "signature") {
      this.iframe_url = this.sanitizer.bypassSecurityTrustResourceUrl(this.signUrl + '?embedded=yes');
    } else if (this.coverActionType == "payment" && ["advance", "balance"].includes(this.paymentPart)) {
      try {
        this.stripe = await loadStripe(stripePK);
      } catch {
        return
      }

      const fetchClientSecret = async () => {
        const response = await firstValueFrom(this.coverPageActionService.getCheckout(this.coverId, this.paymentPart));
        return response.client_secret;
      }

      this.checkout = await this.stripe?.initEmbeddedCheckout({fetchClientSecret});
      this.checkout?.mount('#checkout');
    }
  }

  async ngOnDestroy() {
    this.checkout?.unmount();
    this.checkout?.destroy();
  }
}
