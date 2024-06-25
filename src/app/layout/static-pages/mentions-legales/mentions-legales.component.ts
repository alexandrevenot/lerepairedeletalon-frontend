import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mentions-legales',
  templateUrl: './mentions-legales.component.html',
  styleUrls: ['./mentions-legales.component.css']
})
export class MentionsLegalesComponent {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([`/${path}`]).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
