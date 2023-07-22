import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cover-page',
  templateUrl: './cover-page.component.html',
  styleUrls: ['./cover-page.component.css']
})
export class CoverPageComponent implements OnInit{
  @Input() coverId: string = "";

  public messageFromBuyer = "Yo mec\t\nça va ou quoient?";

  ngOnInit(): void {
    console.log(this.coverId + " from cover-page component")
  }
}
