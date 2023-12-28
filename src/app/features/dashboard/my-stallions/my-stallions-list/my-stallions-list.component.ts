import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MyStallionsListService, getStallionsListArray } from './my-stallions-list.service'
import { getNumberArray } from 'src/environments/environment';

export interface StallionBoxItem {
  id: string | null;
  name: string | null;
  breed: string | null;
  profilePicture: string | null;
  lastUpdateTimestamp: string | null;
  profileStatus: string;
}

@Component({
  selector: 'app-my-stallions-list',
  templateUrl: './my-stallions-list.component.html',
  styleUrls: ['./my-stallions-list.component.css'],
  providers: [MyStallionsListService]
})
export class MyStallionsListComponent implements OnInit {

  @Output() editStallionEvent = new EventEmitter<string>();

  public nbOfStallions: number = 0;
  public getNumberArray = getNumberArray;
  public items: StallionBoxItem[] = [];

  constructor (
    private myStallionsListService: MyStallionsListService
    ) {}
  
  ngOnInit(): void {
    this.loadStallionBoxes();
  }

  loadStallionBoxes() {
    this.myStallionsListService.getStallionsList()
    .subscribe((data: getStallionsListArray) => {
      this.nbOfStallions = data.content.length;

      for (let item of data.content) {
        this.items.push({
          id: item.id,
          name: item.name,
          breed: item.breed,
          profilePicture: item.photo_url,
          lastUpdateTimestamp: item.last_update_timestamp,
          profileStatus: item.profile_status
        });
      }
    })
  }

  handleDashboardStallionBoxEvent(params: {stallionId: string | null, action: 'edit' | 'reload'}) {
    if (params.action == 'reload') {
      this.items = [];
      this.loadStallionBoxes();
    } else if (typeof params.stallionId === 'string'){
      this.editStallionEvent.emit(params.stallionId);
    }
  }
}
