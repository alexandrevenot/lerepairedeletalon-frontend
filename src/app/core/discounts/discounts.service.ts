import { Injectable } from "@angular/core";

@Injectable()
export class DiscountsService {

  acknowledgeFirstCoverDiscount() {
    localStorage.setItem(`firstCoverDiscountIsAcknowledged`, 'yes');
  }

  firstCoverDiscountIsAcknowledged() {
    let value: string | null = localStorage.getItem(`firstCoverDiscountIsAcknowledged`);
    return value? true: false;
  }
}