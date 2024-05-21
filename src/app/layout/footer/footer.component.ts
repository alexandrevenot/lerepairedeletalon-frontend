import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookiesService } from 'src/app/core/cookies/cookies.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
  providers: [CookiesService]
})
export class FooterComponent implements OnInit {
  public cookiesAreAccepted: boolean = false;

  constructor(
    private router: Router,
    private cookiesService: CookiesService
  ) {}

  ngOnInit(): void {
    this.cookiesAreAccepted = this.cookiesService.cookiesAreAccepted();
  }

  acceptCookies() {
    this.cookiesService.acceptCookies();
    this.cookiesAreAccepted = true;
  }

  navigateTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
