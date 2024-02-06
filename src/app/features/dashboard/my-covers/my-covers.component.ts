import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MyCoversService, coversData, coverItem } from './my-covers.service';
import { getNumberArray } from '../../../../environments/environment';

@Component({
  selector: 'app-my-covers',
  templateUrl: './my-covers.component.html',
  styleUrls: ['./my-covers.component.css'],
  providers: [MyCoversService]
})
export class MyCoversComponent implements OnInit{
  @Input() coverStatus!: "pendingApproval" | "pendingSignature" | "onGoing" | "done" | "denied";
  @Input() pointOfView! : "buyer" | "seller";

  @Output() goToCoverPageEvent = new EventEmitter();

  public getNumberArrayF = getNumberArray;

  covers: coverItem[] = [];
  title: Record<string, string> = {};

  constructor(private myCoversService: MyCoversService) {}

  ngOnInit(): void {
    this.title = {
      "pendingApproval": this.pointOfView == "seller" ? "Mes demandes de saillies": "Mes saillies demandées",
      "pendingSignature": "Mes saillies en cours de signature",
      "onGoing": "Mes saillies engagées",
      "done": "Mes saillies terminées",
      "denied": "Mes saillies refusées"
    };

    if (["pendingApproval", "pendingSignature", "onGoing", "done", "denied"].includes(this.coverStatus)) {
      this.myCoversService.getCovers(this.coverStatus, this.pointOfView)
      .subscribe({
        next: (data: coversData) => {
          for (let item of data.items) {
            this.covers.push({
              id: item.id,
              stallion_name: item.stallion_name,
              mare_name: item.mare_name,
              status: item.status,
              price: item.price,
              pov: this.pointOfView
            });
          }
        },
        error: () => {}
      })
    }
  }

  goToCoverPage(coverId: string) {
    this.goToCoverPageEvent.emit(coverId);
  }
}
