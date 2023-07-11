import { Component, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StallionProfileService, returnedStallion } from './stallion-profile.service'
import { getNumberArray, availableCoverTypes } from '../../../../environments/environment'

@Component({
  selector: 'app-stallion-profile',
  templateUrl: './stallion-profile.component.html',
  styleUrls: ['./stallion-profile.component.css'],
  providers: [StallionProfileService]
})
export class StallionProfileComponent {
  @Input() itemId: string | null = null;

  public getNumberArray = getNumberArray;

  public name: string = "";
  public breed: string = "";
  public photos: {[key: string]: string} = {};
  public mainDesc: string = ""
  public color: string = "";
  public birthdate: string = "";
  public height: number | null = null;
  public pedigree: string[] = [];
  public pedigreePO: string = "";
  public offspring: string = "";
  public performance: string = "";
  public comments: string = "";
  public rTypes: string[] = [];
  public price: number | null = null;

  askForMatingIsClicked: boolean = false;
  public askForMatingForm = new FormGroup({
    mare_nSIRE: new FormControl(''),
    mare_name: new FormControl(''),
    buyer_number: new FormControl(''),
    message: new FormControl('')
  });

  constructor(
    private stallionProfileService: StallionProfileService
  ) {}

  ngOnInit() {
    if (typeof this.itemId === "string"){
      this.stallionProfileService.getStallionProfile(this.itemId)
      .subscribe((data: returnedStallion) => {
        const content = data.stallionProfile;
        this.name = content.name;
        this.breed = content.breed;
        this.mainDesc = content.main_desc;
        this.color = content.color;
        this.birthdate = content.birthdate;
        this.height = content.height;
        this.pedigree = content.pedigree.split('~');
        this.pedigreePO = content.pedigree_po;
        this.offspring = content.offspring;
        this.performance = content.performance;
        this.comments = content.comments;
        const rTypes = Object.keys(content.r_types).filter(key => content.r_types[key]);
        for (let rtype of rTypes) {
          this.rTypes.push(availableCoverTypes[rtype])
        }
        this.price = content.price;
  
        for (const [index, photoId] of content.photos.entries()) {
          this.stallionProfileService.getPicture(photoId)
          .subscribe(response => {
            const reader = new FileReader();
            reader.onloadend = () => {
              this.photos[index] = reader.result as string;
            };
            reader.readAsDataURL(response);
          })
        }
      })
    }
  }
  
  getNbOfPhotos() {
    return Object.keys(this.photos).length
  }

  onClick() {
    this.askForMatingIsClicked = true;
  }

  sendDemandClick() {
    console.log(this.askForMatingForm.getRawValue());
  }

  cancelAskClick() {
    this.askForMatingIsClicked = false;
  }
}