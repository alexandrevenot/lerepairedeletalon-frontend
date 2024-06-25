import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-this-website',
  templateUrl: './this-website.component.html',
  styleUrls: ['./this-website.component.css']
})
export class ThisWebsiteComponent {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([`/${path}`]).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
