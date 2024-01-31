import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MyAccountService } from './my-account.service';
import { UserScore, UserScoreService } from 'src/app/core/user-score/user-score.service';
import { backendInteractionStatus } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.css'],
  providers: [MyAccountService]
})
export class MyAccountComponent implements OnInit{
  public userId: string = "";
  public email: string = "";

  // password
  public passwordChangeStatus: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};
  // contractual identity
  public userHasAContractualIdentity: boolean = false;
  public selectedProfileType: string = "";
  public savedProfileType: string = "";
  public updateFormSuccess: Record<string, boolean> = {'status': false};
  public contractualIdentityFormIsBeingModified: boolean = false;
  public contractualIdentityFormHelperIsTriggered: Record<string, boolean> = {'status': false}
  public contractualIdentityFormButtonIsLoading:  Record<string, boolean> = {'status': false}
  public contractualIdentityForm!: FormGroup;
  public accountInformationForm!: FormGroup;
  public updateFormMessage: FormControl = new FormControl('');

  // reviews
  public sellerScore: number | null = null;
  public nbReviewsAsSeller: number = 0;
  public buyerScore: number | null = null;
  public nbReviewsAsBuyer: number = 0;

  // payment
  public bankIdentityFile!: File;
  public bankIdentityFileModalIsActive: boolean = false;
  public bankIdentityFileStatus: string = "";

  // account deletion
  public accountDeletionStatus: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};
  public accountDeletionModalIsActive: boolean = false;
  public accountDeletionInputFormControl: FormControl = new FormControl('');
  public accountDeletionModalHelperMessage: string = "";

  constructor(
    private myAccountService: MyAccountService,
    private formBuilder: FormBuilder,
    private userScoreService: UserScoreService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.contractualIdentityForm = this.formBuilder.group({
      companyOrIndividualRadio: ['', Validators.required],
      gender: ['', Validators.required],
      postalAddress: ['', Validators.required],
      birthdate: ['', Validators.required],
      birthplace: ['', Validators.required],
      citizenship: ['', Validators.required],
      companyName: [''],
      companyStatus: [''],
      capital: [''],
      headOfficeAddress: [''],
      siret: ['']
    })

    this.accountInformationForm = this.formBuilder.group({
      firstname: [''],
      lastname: [''],
      email: [''],
      phoneNumber: [''],
      currentPassword: [''],
      newPassword: ['']
    })

    this.contractualIdentityForm.get('companyOrIndividualRadio')?.valueChanges
    .subscribe(value => {
      this.selectedProfileType = value;
    });

    this.myAccountService.getAccountInformation()
    .subscribe((data: any) => {
      this.userId = data.user_id;

      this.accountInformationForm.get("firstname")?.setValue(data.firstname);
      this.accountInformationForm.get("lastname")?.setValue(data.lastname);
      this.accountInformationForm.get("email")?.setValue(data.email);
      this.email = data.email;
      this.accountInformationForm.get("phoneNumber")?.setValue(data.phone_number);

      if (data.contractual_identity) {
        this.contractualIdentityForm.get("gender")?.setValue(data.contractual_identity.gender);
        this.contractualIdentityForm.get("gender")?.disable();
        this.contractualIdentityForm.get("postalAddress")?.setValue(data.contractual_identity.postal_address);
        this.contractualIdentityForm.get("birthdate")?.setValue(data.contractual_identity.birthdate);
        this.contractualIdentityForm.get("birthplace")?.setValue(data.contractual_identity.birthplace);
        this.contractualIdentityForm.get("citizenship")?.setValue(data.contractual_identity.citizenship);
        if (data.contractual_identity.type == "company") {
          this.contractualIdentityForm.get("companyName")?.setValue(data.contractual_identity.company_name);
          this.contractualIdentityForm.get("companyStatus")?.setValue(data.contractual_identity.company_status);
          this.contractualIdentityForm.get("capital")?.setValue(data.contractual_identity.capital);
          this.contractualIdentityForm.get("headOfficeAddress")?.setValue(data.contractual_identity.head_office_address);
          this.contractualIdentityForm.get("siret")?.setValue(data.contractual_identity.siret);
        }
        this.contractualIdentityForm.get("companyOrIndividualRadio")?.setValue(data.contractual_identity.type);
        this.contractualIdentityForm.get("companyOrIndividualRadio")?.disable();
        this.savedProfileType = data.contractual_identity.type;
        this.userHasAContractualIdentity = true;
      }
      if (data.seller_note) {
        this.sellerScore = data.seller_note;
        this.nbReviewsAsSeller = data.nb_reviews_as_seller;
      }
      if (data.buyer_note) {
        this.buyerScore = data.buyer_note;
        this.nbReviewsAsBuyer = data.nb_reviews_as_buyer;
      }

      if (data.bank_identity) {

      }

      this.userScoreService.getUserScore(this.userId, null, "seller")
      .subscribe((userScore: UserScore) => {
        if (userScore.score) {
          this.sellerScore = userScore.score
        }
        if (userScore.nb_reviews) {
          this.nbReviewsAsSeller = userScore.nb_reviews;
        }
      })

      this.userScoreService.getUserScore(this.userId, null, "buyer")
      .subscribe((userScore: UserScore) => {
        if (userScore.score) {
          this.buyerScore = userScore.score
        }
        if (userScore.nb_reviews) {
          this.nbReviewsAsBuyer = userScore.nb_reviews;
        }
      })
    })
  }

  sendPasswordUpdateEmail() {
    this.myAccountService.sendPasswordUpdateEmail(this.email, this.passwordChangeStatus)
    .subscribe(() => {
      this.passwordChangeStatus["status"] = backendInteractionStatus.Success;
    })
  }

  askForContractualIdentityFormEdit() {
    this.contractualIdentityFormIsBeingModified = true;
    this.contractualIdentityForm.get("companyOrIndividualRadio")?.enable();
    this.contractualIdentityForm.get("gender")?.enable();
  }

  cancelContractualIdentityFormEdition() {
    this.contractualIdentityFormIsBeingModified = false;
    this.contractualIdentityForm.get("companyOrIndividualRadio")?.setValue(this.savedProfileType);
    this.contractualIdentityForm.get("companyOrIndividualRadio")?.disable();
    this.contractualIdentityForm.get("gender")?.disable();
  }

  saveContractualIdentity() {
    if (!this.contractualIdentityForm.valid) {
      this.contractualIdentityFormHelperIsTriggered['status'] = true;
      this.updateFormMessage.setValue("Remplissez s'il vous plaît tous les champs du formulaire.");
      return
    }

    this.contractualIdentityFormButtonIsLoading['status'] = true;
    this.myAccountService.updateContractualIdentity(
      this.selectedProfileType,
      this.contractualIdentityForm.getRawValue(),
      this.contractualIdentityFormHelperIsTriggered,
      this.updateFormMessage,
      this.contractualIdentityFormButtonIsLoading
    ).subscribe(() => {
      this.updateFormMessage.setValue("Les informations ont bien été sauvegardées.")
      this.savedProfileType = this.selectedProfileType;
      this.contractualIdentityFormHelperIsTriggered['status'] = false;
      this.contractualIdentityFormButtonIsLoading['status'] = false;
      this.contractualIdentityFormIsBeingModified = false;
      this.userHasAContractualIdentity = true;
      this.contractualIdentityForm.get("companyOrIndividualRadio")?.disable();
      this.contractualIdentityForm.get("gender")?.disable();
    })
  }

  handleClickReviews(reviewPov: "given" | "received", coverPov: "buyer" | "seller") {
    const url = `/user-reviews?id=${this.userId}&reviewPov=${reviewPov}&coverPov=${coverPov}`;
    window.open(url, '_blank');
  }

  fetchBankIdentityFile(event: any) {
    this.bankIdentityFile = event.target.files[0];
    this.bankIdentityFileModalIsActive = true;
  }

  sendBankIdentityFile() {

  }

  deleteAccount() {
    const value = this.accountDeletionInputFormControl.getRawValue();
    if (value != "Supprimer mon compte") {
      this.accountDeletionModalHelperMessage = "Il semble y avoir une faute dans la phrase de confirmation."
    } else {
      this.accountDeletionModalHelperMessage = "";
      this.accountDeletionStatus['status'] = backendInteractionStatus.Loading;
      this.closeModal();
      this.myAccountService.deleteAccount(value, this.accountDeletionStatus, this.accountDeletionInputFormControl)
      .subscribe(() => {
        this.accountDeletionStatus['status'] = backendInteractionStatus.Success;
        this.authService.disconnectUser();
      })
    }
  }

  openAccountDeletionModal() {
    this.accountDeletionModalIsActive = true;
  }

  closeModal() {
    this.bankIdentityFileModalIsActive = false;
    this.accountDeletionModalIsActive = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}
