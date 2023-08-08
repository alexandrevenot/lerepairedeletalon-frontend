import { Component, OnInit, createPlatform } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { StallionProfileService, returnedStallion } from './stallion-profile.service'
import { getNumberArray, availableCoverTypes, availableBreeds, coverPlaceNames } from '../../../../environments/environment'
import { ActivatedRoute } from '@angular/router';
import { PricingService, checkoutResponse } from 'src/environments/pricing';

@Component({
  selector: 'app-stallion-profile',
  templateUrl: './stallion-profile.component.html',
  styleUrls: ['./stallion-profile.component.css'],
  providers: [
    StallionProfileService,
    PricingService
  ]
})
export class StallionProfileComponent implements OnInit{
  public itemId: string | null = null;

  public getNumberArray = getNumberArray;
  public availableCoverTypes = availableCoverTypes;
  public coverPlaceNames = coverPlaceNames;
  public availableBreeds = availableBreeds;

  // raw data
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
  public owner: string = "";

  // parsed data
  public location: string = "";
  public age: string = "";
  public heightTagValue: string = "";
  public coverTypes: Array<string> = [];
  public coverPlaces: Record<string, string> = {};
  public hasPedigree: boolean = false;

  // form data
  public askForMatingForm!: FormGroup;
  public subtotal: number = 0;
  public serviceFees: number = 0;
  public total: number = 0;

  public selectedCoverTypeValue: string = "";

  // form data validation
  public formNotValid: boolean = false;
  public sendFormMessage!: FormControl;
  public backendErrorStatus: Record<string, boolean> = {'status': false}
  public buttonIsLoading:  Record<string, boolean> = {'status': false}

  constructor(
    private stallionProfileService: StallionProfileService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private pricingService: PricingService
  ) {}

  ngOnInit() {
    this.askForMatingForm = this.formBuilder.group({
      mareName: ['', Validators.required],
      mareNSIRE: ['', Validators.required],
      mareBreed: ['', Validators.required],
      selectedCoverType: ['', Validators.required],
      messageToVendor: ['', Validators.required],
      offeredCoverPlace: ['']
    });

    this.sendFormMessage = new FormControl('');

    let sCTCtrl = this.askForMatingForm.get('selectedCoverType')

    if (sCTCtrl) {
      sCTCtrl.valueChanges.subscribe(value => {

        this.selectedCoverTypeValue = value;

        if (this.coverPlaces[value] != ""){
          this.askForMatingForm.get('offeredCoverPlace')?.setValue("");
        }

        this.pricingService.getCheckout(this.getPriceOfCoverType(value))
        .subscribe((data: checkoutResponse) => {
          this.subtotal = data.subtotal;
          this.serviceFees = data.service_fees;
          this.total = data.total;
        })
      });
    }


    this.route.queryParams.subscribe(params => {
      const stallionId = params['id'];
      this.itemId = stallionId;
    });

    if (typeof this.itemId === "string"){
      this.stallionProfileService.getStallionProfile(this.itemId)
      .subscribe((data: returnedStallion) => {
        const content = data.stallionProfile;
        this.owner = content.owner;
        this.name = content.name;
        this.breed = content.breed;
        this.nSire = content.n_sire;
        this.mainDesc = content.main_desc.replace(/(\r\n|\r|\n)/g, '<br>');
        this.color = content.color;
        this.birthdate = content.birthdate;
        this.height = content.height;
        this.pedigree = content.pedigree.split('~');
        this.pedigreePO = content.pedigree_po.replace(/(\r\n|\r|\n)/g, '<br>');
        this.offspring = content.offspring.replace(/(\r\n|\r|\n)/g, '<br>');
        this.performance = content.performance.replace(/(\r\n|\r|\n)/g, '<br>');
        this.stallionAdditionalInfo = content.cover_additional_info.replace(/(\r\n|\r|\n)/g, '<br>');
        this.city = content.city;
        this.depName = content.dep_name;
        this.regName = content.reg_name;
        this.coverAdditionalInfo = content.cover_additional_info.replace(/(\r\n|\r|\n)/g, '<br>');
        this.prices = content.prices;
        this.location = this.city + ", " + this.depName + ", " + this.regName
        this.age = this.calculateAge(this.birthdate);
        this.heightTagValue = this.height + " centimètres au garrot"
        for (const d of this.prices) {
          this.coverTypes.push(d['cover_type']);
          this.coverPlaces[d['cover_type']] = d['cover_place'];
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
  
  // stallion profile functions
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

  // demand functions
  getPriceOfCoverType(coverType: string) {
    for (const d of this.prices) {
      if (d['cover_type'] == coverType) {
        return d['price']
      }
    }
    return 0
  }

  sendDemandClick() {
    console.log(this.askForMatingForm.getRawValue())
    if (!this.askForMatingForm.valid || (this.coverPlaces[this.selectedCoverTypeValue] == '' && this.askForMatingForm.get('offeredCoverPlace')?.getRawValue() == '')) {
      this.formNotValid = true;
      this.sendFormMessage.setValue("Remplissez s'il vous plaît tous les champs du formulaire de demande.");
      return
    } else {
      this.formNotValid = false;
    }

    this.buttonIsLoading['status'] = true;
    this.stallionProfileService.sendDemandToVendor(
      this.askForMatingForm.getRawValue(),
      this.owner,
      this.nSire,
      this.backendErrorStatus,
      this.sendFormMessage,
      this.buttonIsLoading
    ).subscribe(() => {
      this.backendErrorStatus['status'] = false;
      this.buttonIsLoading['status'] = false;
      this.sendFormMessage.setValue("Demande envoyée avec succès.");
    })
  }
}