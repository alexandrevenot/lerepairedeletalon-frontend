import { Component, Input, OnInit } from '@angular/core';
import { MyCoversService, coversData, coverItem } from './my-covers.service';
import { getNumberArray } from '../../../../environments/environment';

@Component({
  selector: 'app-my-covers',
  templateUrl: './my-covers.component.html',
  styleUrls: ['./my-covers.component.css'],
  providers: [MyCoversService]
})
export class MyCoversComponent implements OnInit{
  @Input() coverStatus!: "pending" | "onGoing" | "done";
  @Input() pointOfView! : "buyer" | "seller";

  public getNumberArrayF = getNumberArray;

  covers: coverItem[] = [];
  title = {
    "pending": "Mes demandes de saillies",
    "onGoing": "Mes saillies en cours",
    "done": "Mes saillies terminées"
  };

  constructor(private myCoversService: MyCoversService) {}

  ngOnInit(): void {
    if (["pending", "onGoing", "done"].includes(this.coverStatus)) {
      this.myCoversService.getCovers(this.coverStatus, this.pointOfView)
      .subscribe((data: coversData) => {
        for (let item of data.items) {
          this.covers.push({
            id: item.id,
            stallion_name: item.stallion_name,
            mare_name: item.mare_name,
            status: item.status,
            income: item.income
          });
        }
      })
    }
  }
}
