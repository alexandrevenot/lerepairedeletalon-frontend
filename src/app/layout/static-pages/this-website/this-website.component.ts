import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from 'src/app/core/seo/seo.service';

@Component({
  selector: 'app-this-website',
  templateUrl: './this-website.component.html',
  styleUrls: ['./this-website.component.css']
})
export class ThisWebsiteComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    const seoData = this.route.snapshot.data;
    this.seoService.initSeo(seoData);
  }

  navigateTo(path: string) {
    this.router.navigate([`/${path}`]).then(() => {
      window.scrollTo(0, 0);
    });
  }
}
