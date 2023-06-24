import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-seller-my-covers',
  templateUrl: './seller-my-covers.component.html',
  styleUrls: ['./seller-my-covers.component.css']
})
export class SellerMyCoversComponent implements OnInit{
  @Input() coverType!: string;

  ngOnInit(): void {
    
  }
}
