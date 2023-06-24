import { Component, Input, OnInit } from '@angular/core';
import { SellerMyCoversService, coversData, coverItem } from './seller-my-covers.service';
import { getNumberArray, statusMapping } from '../../../../environments/environment';

@Component({
  selector: 'app-seller-my-covers',
  templateUrl: './seller-my-covers.component.html',
  styleUrls: ['./seller-my-covers.component.css'],
  providers: [SellerMyCoversService]
})
export class SellerMyCoversComponent implements OnInit{
  @Input() coverType!: "pending" | "onGoing" | "done";

  public getNumberArrayF = getNumberArray;
  public statusMappingObject = statusMapping;

  covers: coverItem[] = [];
  title = {
    "pending": "Mes demandes de saillies",
    "onGoing": "Mes saillies en cours",
    "done": "Mes saillies terminées"
  };

  constructor(private sellerMyCoversService: SellerMyCoversService) {}

  ngOnInit(): void {
    if (["pending", "onGoing", "done"].includes(this.coverType)) {
      this.sellerMyCoversService.getCovers(this.coverType)
      .subscribe((data: coversData) => {
        for (let item of data.items) {
          this.covers.push({
            id: item.id,
            stallion_name: item.stallion_name,
            mare_name: item.mare_name,
            status: this.statusMappingObject[item.status]
          });
        }
      })
    }
  }
}
