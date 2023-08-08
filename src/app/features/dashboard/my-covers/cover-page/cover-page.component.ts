import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CoverPageService, GetCoverInfo } from './cover-page.service';
import { availableCoverTypes, coverPlaceNames, statusCommentaryMapping, statusHelper, statusMapping } from 'src/environments/environment';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-cover-page',
  templateUrl: './cover-page.component.html',
  styleUrls: ['./cover-page.component.css'],
  providers: [CoverPageService]
})
export class CoverPageComponent implements OnInit{
  @Input() coverId: string = "";

  @Output() goToCoverPageActionEvent = new EventEmitter();

  public availableCoverTypes = availableCoverTypes;
  public coverPlaceNames = coverPlaceNames;
  public statusMappingObject = statusMapping;
  public statusCommentaryMappingObject = statusCommentaryMapping;
  public statusHelperObject = statusHelper;
  public statusList: string[] = Object.keys(this.statusMappingObject);

  public stallionName: string = "";
  public stallionBreed: string = "";
  public stallionNSIRE: string = "";
  public mareName: string = "";
  public mareBreed: string = "";
  public mareNSIRE: string = "";
  public contactName: string = "";
  public contactPhoneNumber: string = "";
  public contactEmail: string = "";
  public coverType: string = "";
  public coverPlace: string = "";
  public price: number = 0;
  public messageFromBuyer: string = "";
  public timestamps: Record<string, string> = {};
  public status: string = "";
  public pov: string = "";

  public coverPlaceIsOffered: boolean = false;

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

  // cover management
  public actions: Record<string, Record<string, Record<string, string>>> = {
    seller: {
      green: {
        offered: "Accepter la proposition",
        approved: "",
        signingstarted: "",
        buyersigned: "Signer le contrat",
        sellersigned: "",
        downpaid: "",
        fullypaid: ""
      },
      red: {
        offered: "Refuser la proposition",
        approved: "Annuler la proposition",
        signingstarted: "Annuler la procédure de signature",
        buyersigned: "Annuler la procédure de signature",
        sellersigned: "Demander la non-réalisation de la saillie",
        downpaid: "Demander la déclaration de la saillie comme échouée",
        fullypaid: ""
      }
    },
    buyer: {
      green: {
        offered: "",
        approved: "Engager la procédure de signature",
        signingstarted: "Signer le contrat",
        buyersigned: "",
        sellersigned: "Payer l'acompte de la saillie",
        downpaid: "Payer le solde de la saillie",
        fullypaid: ""
      },
      red: {
        offered: "Annuler la proposition",
        approved: "Annuler la proposition",
        signingstarted: "Annuler la procédure de signature",
        buyersigned: "Annuler la procédure de signature",
        sellersigned: "Demander la non-réalisation de la saillie",
        downpaid: "Demander la déclaration de la saillie comme échouée",
        fullypaid: ""
      }
    }
  }

  constructor(private coverPageService: CoverPageService) {}

  ngOnInit(): void {
    this.loadCoverInfo();
  }

  loadCoverInfo() {
    this.coverPageService.getCoverInfo(this.coverId)
    .subscribe((data: GetCoverInfo) => {
      this.stallionName = data.stallion_name;
      this.stallionBreed = data.stallion_breed;
      this.stallionNSIRE = data.stallion_nsire;
      this.mareName = data.mare_name;
      this.mareBreed = data.mare_breed;
      this.mareNSIRE = data.mare_nsire;
      this.contactName = data.contact_name;
      this.contactPhoneNumber = data.contact_phone_number;
      this.contactEmail = data.contact_email;
      this.coverType = data.cover_type;
      this.price = data.price;
      this.coverPlace = data.cover_place;
      this.messageFromBuyer = data.buyer_message.replace(/(\r\n|\r|\n)/g, '<br>');
      this.timestamps = data.timestamps;
      this.status = data.status;
      this.pov = data.pov;

      this.coverPlaceIsOffered = data.cover_place_is_offered;
      this.notesFormControl.setValue(data.notes);
      this.lastSavedNotesValue = data.notes;
      this.notesFormControl.value;
    })
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

  // cover management
  acceptProposal() {
    this.coverPageService.answerProposal(this.coverId)
    .subscribe(() => {
      this.loadCoverInfo();
    })
  }

  createContract() {
    this.coverPageService.createContract(this.coverId)
    .subscribe(() => {
      this.loadCoverInfo();
    })
  }

  // common cover management methods
  green(status: string, pov: string) {
    if (status == "offered" && pov == "seller") {
      this.acceptProposal();
    } else if (status  == "approved" && pov == "buyer") {
      this.createContract();
    } else if ((status == "signingstarted" && pov == "buyer") || (status == "buyersigned" && pov == "seller")) {
      this.goToCoverPageActionEvent.emit({coverId: this.coverId, coverActionType: "signature"});
    } else if (["sellersigned", "downpaid"].includes(status) && pov == "buyer") {
      this.goToCoverPageActionEvent.emit({coverId: this.coverId, coverActionType: "payment"});
    }
  }

  red(status: string, pov: string) {}
}
