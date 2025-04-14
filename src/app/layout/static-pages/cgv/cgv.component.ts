import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from 'src/app/core/seo/seo.service';

@Component({
  selector: 'app-cgv',
  templateUrl: './cgv.component.html',
  styleUrls: ['./cgv.component.css']
})
export class CgvComponent implements OnInit {
  constructor (private route: ActivatedRoute, private seoService: SeoService) {}

  ngOnInit(): void {
    const seoData = this.route.snapshot.data;
    this.seoService.initSeo(seoData);
  }
}
