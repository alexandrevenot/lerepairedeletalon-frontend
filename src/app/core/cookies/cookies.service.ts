import { Injectable } from "@angular/core";

@Injectable()
export class CookiesService {

  acceptCookies() {
    localStorage.setItem(`cookiesAreAccepted`, 'yes');
  }

  cookiesAreAccepted() {
    let value: string | null = localStorage.getItem(`cookiesAreAccepted`);
    return value? true: false;
  }
}