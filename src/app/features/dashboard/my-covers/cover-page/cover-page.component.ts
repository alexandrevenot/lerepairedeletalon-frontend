import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { CoverPageService, GetCoverInfo } from './cover-page.service';
import { availableCoverTypes, coverPlaceNames, statusCommentaryMapping, statusHelper,
  statusMapping, vaccines, shortBalancePaymentConditions, stds, hostingTypes, getNumberArray } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { UserScore, UserScoreService } from 'src/app/core/user-score/user-score.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cover-page',
  templateUrl: './cover-page.component.html',
  styleUrls: ['./cover-page.component.css'],
  providers: [CoverPageService]
})
export class CoverPageComponent implements OnInit{
  @Input() coverId: string = "";

  @Output() goToCoverPageActionEvent = new EventEmitter();

  public getNumberArray = getNumberArray;

  public availableCoverTypes = availableCoverTypes;
  public coverPlaceNames = coverPlaceNames;
  public statusMappingObject = statusMapping;
  public statusCommentaryMappingObject = statusCommentaryMapping;
  public statusHelperObject = statusHelper;
  public statusList: string[] = Object.keys(this.statusMappingObject);
  public stdsMapping = stds;
  public availableSTDS = Object.keys(stds);
  public hostingMapping = hostingTypes;
  public availableHostingTypes = Object.keys(hostingTypes);

  public stallionName: string = "";
  public stallionBreed: string = "";
  public stallionNSIRE: string = "";
  public stallionProductionBreeds: string = "";
  public stallionVaccines: string = "";
  public stallionSTDNegativeTests: Array<string> = [];
  public mareName: string = "";
  public mareBreed: string = "";
  public mareNSIRE: string = "";
  public contactId: string = "";
  public contactFirstname: string = "";
  public contactLastname: string = "";
  public contactPhoneNumber: string = "";
  public contactEmail: string = "";
  public coverType: string = "";
  public coverPlace: string = "";
  public price: number = 0;
  public basePrice: number = 0;
  public balancePaymentCondition: string = "";
  public advancePercentage: string = "";
  public maxNbOfAttempts: number = 0;
  public demandedSTDNegativeTests: Array<string> = [];
  public demandedVaccines: string = "";
  public hostingSpecs: Array<string> = [];
  public nbProvidedStraws: string = "";
  public leftStrawsOwner: string = "";
  public arrivalDate: string = "";
  public messageFromBuyer: string = "";
  public timestamps: Array<Record<string, string>> = [];

  public status: string = "";
  public pov: string = "";
  public alreadyReviewed: boolean = false;

  public contactScoreString: string = "-/5";
  public contactNbReviewsString: string = "0 évaluation";

  public messageTitle: Record<string, string> = {
    "seller": "Message de l'acheteur",
    "buyer": "Le message que vous avez laissé"
  }
  public messageContact: Record<string, string> = {
    "seller": "Contact de l'acheteur",
    "buyer": "Contact du vendeur"
  }

  public lastSavedNotesValue: string = "";
  public notesFormControl: FormControl = new FormControl('');

  public updateNotesMessage: FormControl = new FormControl('');
  public updateNotesSuccess: Record<string, boolean> = {'status': false};
  public notesAreBeingModified: boolean = false;

  public newArrivalDate: FormControl = new FormControl('');
  public arrivalDateChangeFailed: Record<string, boolean> = {"value": false};
  public displayArrivalDateHelper: Record<string, boolean> = {"value": false};
  public newArrivalDateModalIsActive: boolean = false;

  public newBasePrice: FormControl = new FormControl('');
  public basePriceChangeFailed: Record<string, boolean> = {"value": false};
  public displayBasePriceHelper: Record<string, boolean> = {"value": false};
  public newBasePriceModalIsActive: boolean = false;

  public valueForPutCover: string | number = "";

  public reviewFormControl: FormControl = new FormControl('');
  public reviewPlaceholder: string = "";
  public reviewSelectedScore: number = 0;
  public reviewComment: string = "";
  public reviewModalIsActive: boolean = false;
  public reviewStatus: Record<string, string> = {"status": ""}; // "", "loading", "scoreError", "commentError" "backendError", "success"
  public alreadyReviewedMessage: string = "Cette saillie a déjà été évaluée."

  // cover management
  public actions: Record<string, Record<string, Record<string, string>>> = {
    seller: {
      green: {
        requested: "Accepter la proposition",
        approved: "",
        signingstarted: "",
        buyersigned: "Signer le contrat",
        sellersigned: "",
        downpaid: "",
        fullypaid: "",
        denied: ""
      },
      red: {
        requested: "Refuser la proposition",
        approved: "Revenir à 'Proposée'",
        signingstarted: "",
        buyersigned: "",
        sellersigned: "",
        downpaid: "",
        fullypaid: "",
        denied: "Revenir à 'Proposée'"
      }
    },
    buyer: {
      green: {
        requested: "",
        approved: "Signer le contrat",
        signingstarted: "Signer le contrat",
        buyersigned: "",
        sellersigned: "Payer l'acompte de la saillie",
        downpaid: "Payer le solde de la saillie",
        fullypaid: "",
        denied: ""
      },
      red: {
        requested: "",
        approved: "",
        signingstarted: "",
        buyersigned: "",
        sellersigned: "",
        downpaid: "",
        fullypaid: "",
        denied: ""
      }
    }
  }

  constructor(
    private coverPageService: CoverPageService,
    private userScoreService: UserScoreService,
    ) {}

  ngOnInit(): void {
    this.loadCoverInfo();
  }

  loadCoverInfo() {
    this.coverPageService.getCoverInfo(this.coverId)
    .subscribe((data: GetCoverInfo) => {
      this.stallionName = data.stallion_name;
      this.stallionBreed = data.stallion_breed;
      this.stallionNSIRE = data.stallion_nsire;

      let stallionProductionBreedsString = "";
      data.stallion_production_breeds.forEach(
        (value: string) => {
          stallionProductionBreedsString += (value + ", ");
        }
      );
      this.stallionProductionBreeds = stallionProductionBreedsString.slice(0, -2);

      let stallionVaccinesString = "";
      data.stallion_vaccines.forEach(
        (value: string) => {
          stallionVaccinesString += (vaccines[value] + ", ");
        }
      )
      this.stallionVaccines = stallionVaccinesString.slice(0, -2);

      this.stallionSTDNegativeTests = [];
      for (let std of this.availableSTDS) {
        if (Object.keys(data.stallion_std_negative_tests).includes(std)
        && data.stallion_std_negative_tests[std]) {
          this.stallionSTDNegativeTests.push(this.stdsMapping[std] + ", testé le " + data.stallion_std_negative_tests[std]['test_date']);
        }
      }
      this.mareName = data.mare_name;
      this.mareBreed = data.mare_breed;
      this.mareNSIRE = data.mare_nsire;
      this.contactId = data.contact_id;
      this.contactFirstname = data.contact_firstname;
      this.contactLastname = data.contact_lastname;
      this.contactPhoneNumber = data.contact_phone_number;
      this.contactEmail = data.contact_email;
      this.coverType = data.cover_type;
      this.price = data.price;
      this.basePrice = data.base_price;
      this.coverPlace = ['iart', 'iac'].includes(data.cover_type)? data.provided_cover_place : data.cover_specs.cover_place;

      this.balancePaymentCondition = shortBalancePaymentConditions[data.cover_specs.balance_payment_condition];

      this.advancePercentage = data.cover_specs.advance_percentage.toString() + '% du prix total';

      if (['lib', 'hand', 'iai'].includes(this.coverType)) {
        this.maxNbOfAttempts = data.cover_specs.maximum_nb_of_attempts;

        this.hostingSpecs = [];
        for (let htype of this.availableHostingTypes) {
          if (Object.keys(data.cover_specs.hosting_specs).includes(htype)
          && data.cover_specs.hosting_specs[htype]) {
            this.hostingSpecs.push(this.hostingMapping[htype] + ", au prix de " + data.cover_specs.hosting_specs[htype]['price'] + '€ par jour');
          }
        }
      }

      if (['lib', 'hand'].includes(this.coverType)) {
        this.demandedSTDNegativeTests = [];
        for (let std of this.availableSTDS) {
          if (Object.keys(data.cover_specs.demanded_std_negative_tests).includes(std)
          && data.cover_specs.demanded_std_negative_tests[std]) {
            this.demandedSTDNegativeTests.push(this.stdsMapping[std] + ", " + data.cover_specs.demanded_std_negative_tests[std]['test_oldness'] + ' jours avant la saillie');
          }
        }

        let demandedVaccinesString = "";
        data.cover_specs.demanded_vaccines.forEach(
          (value: string) => {
            demandedVaccinesString += (vaccines[value] + ", ");
          }
        )
        this.demandedVaccines = demandedVaccinesString.slice(0, -2);
      }

      if (['iart', 'iac'].includes(this.coverType)) {
        this.nbProvidedStraws = data.cover_specs.nb_provided_straws;
      }

      if (this.coverType == 'iac') {
        let leftStrawsOwnerRaw = data.cover_specs.left_straws_owner;
        this.leftStrawsOwner = leftStrawsOwnerRaw == 'buyer'? "L'acheteur": "Le vendeur";
      }

      this.arrivalDate = data.arrival_date;

      this.messageFromBuyer = data.buyer_message.replace(/(\r\n|\r|\n)/g, '<br>');
      this.timestamps = data.timestamps;
      this.status = data.status;
      this.pov = data.pov;

      this.alreadyReviewed = (this.pov == "seller" && data.reviewed_by_seller) || (this.pov == "buyer" && data.reviewed_by_buyer);

      this.notesFormControl.setValue(data.notes);
      this.lastSavedNotesValue = data.notes;
      this.notesFormControl.value;

      this.reviewPlaceholder = "Donnez votre avis sur le déroulement de cette saillie, ";
      if (this.pov == "seller") {
        this.reviewPlaceholder += "et sur l'acheteur.";
      } else {
        this.reviewPlaceholder += "sur l'étalon et sur le vendeur."
      }

      let userScoreObservable: Observable<UserScore>;
      if (this.pov == "seller") {
        userScoreObservable = this.userScoreService.getUserScore(
          this.contactId,
          null,
          "buyer"
        )
      } else {
        userScoreObservable = this.userScoreService.getUserScore(
          this.contactId,
          this.stallionNSIRE,
          "seller"
        )
      }

      userScoreObservable.subscribe((userScore: UserScore) => {
        if (userScore.score) {
          this.contactScoreString = userScore.score.toString() + "/5";
        }
        if (userScore.nb_reviews) {
          this.contactNbReviewsString = userScore.nb_reviews.toString() + " évaluation";
          if (userScore.nb_reviews > 1) {
            this.contactNbReviewsString += "s";
          }
        }
      })
    })
  }

  openReviews(contactPov: "buyer" | "seller") {
    let url: string;
    if (contactPov == "seller") {
      url = `/user-reviews?id=${this.contactId}&reviewPov=received&coverPov=seller&stallionNSIRE=${this.stallionNSIRE}`;
    } else {
      url = `/user-reviews?id=${this.contactId}&reviewPov=received&coverPov=buyer`;
    }

    window.open(url, '_blank');
  }

  saveNewArrivalDate() {
    this.closeModal("arrivalDate");
    this.coverPageService.putCover(this.coverId, "arrivalDate", this.valueForPutCover,
      this.arrivalDateChangeFailed, this.displayArrivalDateHelper)
    .subscribe(() => {
      this.loadCoverInfo();
      if (!this.arrivalDateChangeFailed["value"]) {
        this.displayArrivalDateHelper["value"] = false;
      }
      this.arrivalDateChangeFailed["value"] = false;
      this.newArrivalDate.setValue("");
    });

  }

  saveNewBasePrice() {
    this.closeModal("basePrice");
    this.coverPageService.putCover(this.coverId, "basePrice", this.valueForPutCover,
      this.basePriceChangeFailed, this.displayBasePriceHelper)
    .subscribe(() => {
      this.loadCoverInfo();
      if (!this.basePriceChangeFailed["value"]) {
        this.displayBasePriceHelper["value"] = false;
      }
      this.basePriceChangeFailed["value"] = false;
      this.newBasePrice.setValue("");
    });

  }

  triggerModal(modalType: "arrivalDate" | "basePrice" | "review") {
    if (modalType == "arrivalDate") {
      const value = this.newArrivalDate.getRawValue();
      if (value) {
        const dateFormatRegex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!dateFormatRegex.test(value)) {
          this.arrivalDateChangeFailed["value"] = true;
          this.displayArrivalDateHelper["value"] = true;
          return
        }
        this.valueForPutCover = value
        this.newArrivalDateModalIsActive = true;
      }
    } else if (modalType == "basePrice") {
      const value = this.newBasePrice.getRawValue();
      if (value) {
        const newSubtotal = parseInt(value);
        if (isNaN(newSubtotal)) {
            this.basePriceChangeFailed["value"] = true;
            this.displayBasePriceHelper["value"] = true;
            return
        }
        this.valueForPutCover = newSubtotal;
        this.newBasePriceModalIsActive = true;
      }
    } else {
      this.reviewModalIsActive = true;
    }
  }

  closeModal(modalType: "arrivalDate" | "basePrice" | "review") {
    if (modalType == "arrivalDate") {
      this.newArrivalDateModalIsActive = false;
    } else if (modalType == "basePrice") {
      this.newBasePriceModalIsActive = false;
    } else {
      this.reviewModalIsActive = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal("arrivalDate");
      this.closeModal("basePrice");
      this.closeModal("review");
    }
  }

  askForNotesEdit() {
    this.notesAreBeingModified = true;
  }

  cancelNotesEdition() {
    this.notesAreBeingModified = false;
    this.notesFormControl.setValue(this.lastSavedNotesValue);
  }

  updateNotes() {
    this.coverPageService.updateNotes(this.coverId, this.notesFormControl.value, this.updateNotesMessage, this.updateNotesSuccess)
    .subscribe(() => {
      this.lastSavedNotesValue = this.notesFormControl.value;
      this.updateNotesMessage.setValue("Les notes ont bien été sauvegardées.")
      this.updateNotesSuccess['status'] = true;
      this.notesAreBeingModified = false;
    })
  }

  updateReviewScore(value: number) {
    this.reviewSelectedScore = value;
  }

  checkFieldsAndOpenReviewModal() {
    if ([1, 2, 3, 4, 5].includes(this.reviewSelectedScore)) {
      const comment = this.reviewFormControl.getRawValue();
      if (comment) {
        this.reviewComment = comment;
        this.reviewStatus['status'] = "loading";
        this.triggerModal("review");
        return
      } else {
        this.reviewStatus['status'] = "commentError";
      }
    } else {
      this.reviewStatus['status'] = "scoreError";
    }
  }

  postReview() {
    this.closeModal("review");
    this.coverPageService.postReview(
      this.contactId,
      this.coverId,
      this.reviewSelectedScore,
      this.reviewComment,
      this.reviewStatus
    )
    .subscribe(() => {
      this.reviewStatus['status'] = "success";
      this.alreadyReviewedMessage = "L'évaluation a bien été postée.";
      this.alreadyReviewed = true;
    })
  }

  // common cover management methods
  stepForwardCover(nextStatus: string) {
    this.coverPageService.stepForwardCover(this.coverId, nextStatus)
    .subscribe(() => {
      this.loadCoverInfo();
    })
  }

  green(status: string, pov: string) {
    if (status == "requested" && pov == "seller") {
      this.stepForwardCover('approved');
    } else if ((["signingstarted", "approved"].includes(status) && pov == "buyer") || (status == "buyersigned" && pov == "seller")) {
      this.goToCoverPageActionEvent.emit({coverId: this.coverId, coverActionType: "signature"});
    } else if (["sellersigned", "downpaid"].includes(status) && pov == "buyer") {
      this.goToCoverPageActionEvent.emit({coverId: this.coverId, coverActionType: "payment"});
    }
  }

  red(status: string, pov: string) {
    if (pov == "seller") {
      if (status == "requested") {
        this.stepForwardCover('denied');
      } else if (status == "approved") {
        this.stepForwardCover('requested');
      } else if (status == "denied") {
        this.stepForwardCover('requested');
      }
    }
  }
}
