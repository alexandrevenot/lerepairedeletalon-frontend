import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { StallionProfileService, StallionProfile } from './stallion-profile.service'
import { getNumberArray, availableCoverTypes, getAvailableBreeds, coverPlaceNames, balancePaymentConditions, stds, vaccines, hostingTypes } from '../../../../environments/environment'
import { ActivatedRoute } from '@angular/router';
import { PricingService, checkoutResponse } from 'src/environments/pricing';
import { PhotosService } from 'src/environments/photos';
import { FavoriteStallionsService, FavoriteStallions } from '../../dashboard/favorite-stallions/favorite-stallions.service';

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
  public availableBreeds = getAvailableBreeds();
  public balancePaymentConditionsCorresp = balancePaymentConditions;
  public stds = stds;
  public availableSTDS = Object.keys(this.stds);
  public vaccines = vaccines;
  public availableVaccines = Object.keys(this.vaccines);
  public hostingTypes = hostingTypes;

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
  public coverSpecs: any = {};
  public productionBreeds: Array<string> = [];
  public owner: string = "";
  public stallionVaccines: Array<string> = [];
  public crossbreedingAdvice: string = "";

  // parsed data
  public location: string = "";
  public age: string = "";
  public heightTagValue: string = "";
  public coverTypes: Array<string> = [];
  public hasPedigree: boolean = false;
  public stallionSTDNegativeTests: Array<string> = [];
  public stallionSTDNegativeTestsTD: Record<string, string> = {};

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
  public buttonIsLoading: Record<string, boolean> = {'status': false}
  public formModalIsActive: boolean = false;

  // favorite stallions
  public favoriteStallions: Array<string> = [];

  constructor(
    private stallionProfileService: StallionProfileService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private pricingService: PricingService,
    private photosService: PhotosService,
    private favoriteStallionsService: FavoriteStallionsService
  ) {}

  ngOnInit() {
    this.askForMatingForm = this.formBuilder.group({
      mareName: ['', Validators.required],
      mareNSIRE: ['', Validators.required],
      mareBreed: ['', Validators.required],
      selectedCoverType: ['', Validators.required],
      messageToVendor: ['', Validators.required],
      providedCoverPlace: ['']
    });

    this.sendFormMessage = new FormControl('');

    let sCTCtrl = this.askForMatingForm.get('selectedCoverType')

    if (sCTCtrl) {
      sCTCtrl.valueChanges.subscribe(value => {

        this.selectedCoverTypeValue = value;

        if (['iart', 'iac'].includes(value)){
          this.askForMatingForm.get('providedCoverPlace')?.setValue("");
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
      .subscribe((content: StallionProfile) => {
        this.owner = content.owner;
        this.name = content.name;
        this.breed = content.breed;
        this.nSire = content.n_sire;
        this.mainDesc = content.main_desc.replace(/(\r\n|\r|\n)/g, '<br>');
        this.color = content.color;
        this.age = (content.age < 2) ? content.age.toString() + " an" : content.age.toString() + " ans";
        this.height = content.height;
        this.pedigree = content.pedigree;
        this.pedigreePO = content.pedigree_po.replace(/(\r\n|\r|\n)/g, '<br>');
        this.offspring = content.offspring.replace(/(\r\n|\r|\n)/g, '<br>');
        this.performance = content.performance.replace(/(\r\n|\r|\n)/g, '<br>');
        this.stallionAdditionalInfo = content.stallion_additional_info.replace(/(\r\n|\r|\n)/g, '<br>');
        this.crossbreedingAdvice = content.crossbreeding_advice.replace(/(\r\n|\r|\n)/g, '<br>');
        this.city = content.city;
        this.depName = content.dep_name;
        this.regName = content.reg_name;
        this.coverAdditionalInfo = content.cover_additional_info.replace(/(\r\n|\r|\n)/g, '<br>');
        this.coverSpecs = content.cover_specs;
        this.productionBreeds = content.production_breeds;
        this.stallionVaccines = content.stallion_vaccines;
        for (let std of this.availableSTDS) {
          if (Object.keys(content.stallion_std_negative_tests).includes(std)
          && content.stallion_std_negative_tests[std]) {
            this.stallionSTDNegativeTests.push(std);
            this.stallionSTDNegativeTestsTD[std] = content.stallion_std_negative_tests[std]['test_date']
          }
        }
        this.location = this.city + ", " + this.depName + ", " + this.regName
        this.heightTagValue = this.height + " centimètres au garrot"
        for (const [key, value] of Object.entries(this.coverSpecs)) {
          if (value) {
            this.coverTypes.push(key);
          }
        }
        for (const parent of this.pedigree) {
          if (parent != "") {
            this.hasPedigree = true;
          }
        }
  
        for (const [index, photoId] of content.photos.entries()) {
          this.photosService.getPhoto(photoId)
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

    this.loadFavoriteStallions();
  }
  
  loadFavoriteStallions() {
    this.favoriteStallionsService.getFavorites()
    .subscribe((data: FavoriteStallions) => {
      this.favoriteStallions = data.favorite_stallions;
    })
  }

  updateFavorite() {
    if (this.itemId) {
      if (this.favoriteStallions.includes(this.itemId)) {
        this.favoriteStallionsService.removeFromFavorites(this.itemId)
        .subscribe(() => this.loadFavoriteStallions());
      } else {
        this.favoriteStallionsService.addToFavorites(this.itemId)
        .subscribe(() => this.loadFavoriteStallions());
      }
    }
  }

  getNonNullKeys(obj: any) {
    let toReturn = [];
    for (let [key, value] of Object.entries(obj)) {
      if (value) {
        toReturn.push(key);
      }
    }
    return toReturn;
  }

  // stallion profile functions
  getNbOfPhotos() {
    return Object.keys(this.photos).length
  }

  // demand functions
  getPriceOfCoverType(coverType: string){
    if (this.coverSpecs[coverType] != null) {
      return this.coverSpecs[coverType].price
    } else {
      return 0
    }
  }

  triggerModal() {
    this.formModalIsActive = true;
  }

  closeModal() {
    this.formModalIsActive = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  checkFieldsAndOpenModal() {
    if (!this.askForMatingForm.valid || (['iart', 'iac'].includes(this.selectedCoverTypeValue) && this.askForMatingForm.get('providedCoverPlace')?.getRawValue() == '')) {
      this.formNotValid = true;
      this.sendFormMessage.setValue("Remplissez s'il vous plaît tous les champs du formulaire de demande.");
      return
    } else {
      this.formNotValid = false;
    }

    this.triggerModal();
  }

  sendDemandClick() {
    this.closeModal();
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