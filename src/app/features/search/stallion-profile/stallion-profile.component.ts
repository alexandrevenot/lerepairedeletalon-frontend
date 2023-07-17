import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StallionProfileService, returnedStallion } from './stallion-profile.service'
import { getNumberArray, availableCoverTypes } from '../../../../environments/environment'
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-stallion-profile',
  templateUrl: './stallion-profile.component.html',
  styleUrls: ['./stallion-profile.component.css'],
  providers: [StallionProfileService]
})
export class StallionProfileComponent {
  public itemId: string | null = null;

  public getNumberArray = getNumberArray;
  public availableCoverTypes = availableCoverTypes;

  public name: string = "";
  public breed: string = "";
  public nSire: string = "";
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
  public city: string = "";
  public depName: string = "";
  public regName: string = "";
  public coverAdditionalInfo: string = "";
  public stallionAdditionalInfo: string = "";
  public prices: Array<Record<string, any>> = [];

  public location: string = "";
  public age: string = "";
  public heightTagValue: string = "";
  public coverTypes: Array<string> = [];
  public hasPedigree: boolean = false;

  askForMatingIsClicked: boolean = false;
  public askForMatingForm = new FormGroup({
    mare_nSIRE: new FormControl(''),
    mare_name: new FormControl(''),
    buyer_number: new FormControl(''),
    message: new FormControl('')
  });

  constructor(
    private stallionProfileService: StallionProfileService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const stallionId = params['id'];
      this.itemId = stallionId;
    });

    if (typeof this.itemId === "string"){
      this.stallionProfileService.getStallionProfile(this.itemId)
      .subscribe((data: returnedStallion) => {
        const content = data.stallionProfile;
        this.name = content.name;
        this.breed = content.breed;
        this.nSire = content.n_sire;
        this.mainDesc = content.main_desc.replace(/(\r\n|\r|\n)/g, '<br>');;
        this.color = content.color;
        this.birthdate = content.birthdate;
        this.height = content.height;
        this.pedigree = content.pedigree.split('~');
        this.pedigreePO = content.pedigree_po.replace(/(\r\n|\r|\n)/g, '<br>');;
        this.offspring = content.offspring.replace(/(\r\n|\r|\n)/g, '<br>');
        this.performance = content.performance.replace(/(\r\n|\r|\n)/g, '<br>');;
        this.stallionAdditionalInfo = content.cover_additional_info.replace(/(\r\n|\r|\n)/g, '<br>');;
        this.city = content.city;
        this.depName = content.dep_name;
        this.regName = content.reg_name;
        this.coverAdditionalInfo = content.cover_additional_info.replace(/(\r\n|\r|\n)/g, '<br>');;
        this.prices = content.prices;

        this.location = this.city + ", " + this.depName + ", " + this.regName
        this.age = this.calculateAge(this.birthdate);
        this.heightTagValue = this.height + " centimètres au garrot"
        for (const d of this.prices) {
          this.coverTypes.push(availableCoverTypes[d['cover_type']]);
        }
        for (const parent of this.pedigree) {
          if (parent != "") {
            this.hasPedigree = true;
          }
        }
  
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
  
  calculateAge(dateString: string): string {
    const birthDate = new Date(dateString);
    const today = new Date();
  
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
  
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  
    if (age === 1) {
      return age.toString() + " an"
    } else {
      return age.toString() + " ans"
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