import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MyStallionsListService, getStallionsListArray } from './my-stallions-list.service'
import { getNumberArray } from 'src/environments/environment';

export interface StallionBoxItem {
  id: string | null;
  name: string | null;
  breed: string | null;
  profilePicture: string | null;
}

@Component({
  selector: 'app-my-stallions-list',
  templateUrl: './my-stallions-list.component.html',
  styleUrls: ['./my-stallions-list.component.css'],
  providers: [MyStallionsListService]
})
export class MyStallionsListComponent implements OnInit {

  public nbOfStallions: number = 0;
  public getNumberArray = getNumberArray;
  public items: StallionBoxItem[] = [];

  constructor (private myStallionsListService: MyStallionsListService) {

  }
  
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
          profilePicture: null
        });

        const index: number = this.items.length - 1;

        this.myStallionsListService.getProfilePicture(item.photoId)
        .subscribe(response => {
          const reader = new FileReader();
          reader.onloadend = () => {
            this.items[index].profilePicture = reader.result as string;
          };
          reader.readAsDataURL(response);
        })
      }
    })
  }

}
