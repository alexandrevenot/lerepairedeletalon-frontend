import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { StallionProfileService, StallionProfile } from './stallion-profile.service'
import { getNumberArray, availableCoverTypes, getAvailableBreeds, coverPlaceNames, balancePaymentConditions, stds, vaccines, objectStorageBaseUrl, photosPrefix, backendInteractionStatus } from '../../../../environments/environment'
import { ActivatedRoute } from '@angular/router';
import { PricingService, checkoutResponse } from 'src/app/core/pricing/pricing.service';
import { FavoriteStallionsService, FavoriteStallions } from '../../dashboard/favorite-stallions/favorite-stallions.service';
import { UserScore, UserScoreService } from 'src/app/core/user-score/user-score.service';
import { SeoService } from 'src/app/core/seo/seo.service';

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
  public objectStorageBaseUrl = objectStorageBaseUrl;
  public photosPrefix = photosPrefix;

  // raw data
  public handlerName: string = "";
  public name: string = "";
  public breed: string = "";
  public nSire: string = "";
  public photos: Array<string> = [];
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
  public handlerId: string = "";
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
  public score: number = 0;
  public nbReviewsAsSeller: number = 0;
  public handlerHasOtherReviews: boolean = false;

  // form data
  public askForMatingForm!: FormGroup;
  public subtotal: number = 0;
  public serviceFees: number = 0;
  public total: number = 0;

  public selectedCoverTypeValue: string = "";

  // form data validation
  public sendFormMessage!: FormControl;
  public demandStatus: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};
  public formModalIsActive: boolean = false;

  // favorite stallions
  public favoriteStallions: Array<string> = [];

  constructor(
    private stallionProfileService: StallionProfileService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private pricingService: PricingService,
    private favoriteStallionsService: FavoriteStallionsService,
    private userScoreService: UserScoreService,
    private seoService: SeoService
  ) {}

  ngOnInit() {
    this.askForMatingForm = this.formBuilder.group({
      mareName: ['', Validators.required],
      mareNSIRE: ['', Validators.required],
      mareBreed: ['', Validators.required],
      selectedCoverType: ['', Validators.required],
      messageToSeller: ['', Validators.required],
      marePregnancyHistory: ['', Validators.required]
    });

    this.sendFormMessage = new FormControl('');

    this.askForMatingForm.get('selectedCoverType')?.valueChanges.subscribe(value => {
      this.selectedCoverTypeValue = value;

      this.pricingService.getCheckout(this.getPriceOfCoverType(value))
      .subscribe({
        next: (data: checkoutResponse) => {
          this.subtotal = data.subtotal;
          this.serviceFees = data.fees;
          this.total = data.total;
        },
        error: () => {}
      })
    });

    this.route.params.subscribe(params => {
      const idAndName = params['idAndName'];
      const splittedIdAndName = idAndName.split("-");
      const stallionId = splittedIdAndName[0];
      this.itemId = stallionId;
    });

    if (typeof this.itemId === "string"){
      this.stallionProfileService.getStallionProfile(this.itemId)
      .subscribe({
        next: (content: StallionProfile) => {
          this.handlerId = content.handler_id;
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
          if (this.coverTypes.length === 1) {
            this.askForMatingForm.get('selectedCoverType')?.setValue(this.coverTypes[0]);
          }
          for (const parent of this.pedigree) {
            if (parent != "") {
              this.hasPedigree = true;
            }
          }
    
          content.photos.forEach((photoUrl: string) => {
            this.photos.push(objectStorageBaseUrl + photosPrefix + '/' + photoUrl);
          })
  
          const seoData = {
            title: `Profil de ${content.name} | Le Repaire de l'Étalon`,
            meta: [{
              name: 'description',
              content: `Consultez le profil de l'étalon ${content.name}: sa taille, son âge, sa robe, ses races de production, son pedigree, son statut sanitaire, ses performances, entre autres.`
            }]
          }
          this.seoService.initSeo(seoData);

          this.userScoreService.getUserScore(
            this.handlerId,
            this.nSire,
            "seller"
          ).subscribe((userScore: UserScore) => {
            this.handlerName = userScore.firstname + " " + userScore.lastname.toUpperCase();
    
            if (userScore.nb_reviews) {
              this.nbReviewsAsSeller = userScore.nb_reviews;
            }
    
            if (userScore.score) {
              this.score = userScore.score;
            }
    
            if (userScore.handler_has_other_reviews) {
              this.handlerHasOtherReviews = true;
            }
          })
        },
        error: () => {}
      })
    }

    this.loadFavoriteStallions();
  }
  
  loadFavoriteStallions() {
    this.favoriteStallionsService.getFavorites()
    .subscribe({
      next: (data: FavoriteStallions) => {
        this.favoriteStallions = data.favorite_stallions;
      },
      error: () => {}
    })
  }

  updateFavorite() {
    if (this.itemId) {
      if (this.favoriteStallions.includes(this.itemId)) {
        this.favoriteStallionsService.removeFromFavorites(this.itemId)
        .subscribe({
          next: () => {this.loadFavoriteStallions()},
          error: () => {}
        });
      } else {
        this.favoriteStallionsService.addToFavorites(this.itemId)
        .subscribe({
          next: () => {this.loadFavoriteStallions()},
          error: () => {}
        });
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

  openReviewsForStallion() {
    const url = `/evaluations?id=${this.handlerId}&reviewPov=received&coverPov=seller&stallionNSIRE=${this.nSire}`;
    window.open(url, '_blank');
  }

  openAllReviews() {
    const url = `/evaluations?id=${this.handlerId}&reviewPov=received&coverPov=seller`;
    window.open(url, '_blank');
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
    if (!this.askForMatingForm.valid) {
      this.demandStatus['status'] = backendInteractionStatus.UserError;
      this.sendFormMessage.setValue("Remplissez s'il vous plaît tous les champs du formulaire de demande.");
      return
    }
    this.triggerModal();
  }

  sendDemandClick() {
    this.closeModal();
    if (this.itemId === null) {
      return
    }
    this.demandStatus['status'] = backendInteractionStatus.Loading;
    this.stallionProfileService.sendDemandToSeller(
      this.askForMatingForm.getRawValue(),
      this.itemId,
      this.handlerId,
      this.nSire,
      this.demandStatus,
      this.sendFormMessage,
    ).subscribe({
      next: () => {
        this.demandStatus['status'] = backendInteractionStatus.Success;
        this.sendFormMessage.setValue("Demande envoyée avec succès.");
      },
      error: () => {}
    })
  }
}