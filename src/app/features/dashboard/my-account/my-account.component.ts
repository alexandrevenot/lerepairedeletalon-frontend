import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Account, MyAccountService, PutLegalIdentityResponse, StripeAccount } from './my-account.service';
import { UserScore, UserScoreService } from 'src/app/core/user-score/user-score.service';
import { backendInteractionStatus, stripeFilesMaxSizeInBytes } from 'src/environments/environment';
import { AuthService } from 'src/app/core/auth/auth.service';
import { firstValueFrom } from 'rxjs';

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

  // legal identity
  public legalIdentityLevel: number = 0;

  public legalIdentity0Form!: FormGroup;

  public selectedBusinessType: string = "";
  public savedBusinessType: string = "";

  public legalIdentityForm1IsBeingModified: boolean = false;
  public legalIdentity1Status: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};
  public legalIdentity1Form!: FormGroup;
  public legalIdentity1FormLastSavedValue: any;
  public updateLegalIdentity1FormMessage: FormControl = new FormControl('');
  public legalIdentity1ModalIsActive: boolean = false;

  public userLegalIdentity2Status: "none" | "pending" | "unverified" | "verified" = "none";
  public legalIdentity2StatusToTag: Record<string, string> = {
    'none': 'Non renseigné',
    'pending': 'En cours de vérification',
    'unverified': 'Nécessite action',
    'verified': 'Validé'
  }
  public legalIdentity2Form!: FormGroup;
  public legalIdentity2FormLastSavedValue:any;
  public legalIdentityForm2IsBeingModified: boolean = false;
  public legalIdentity2Status: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};
  public legalIdentity2ModalIsActive: boolean = false;
  public updateLegalIdentity2FormMessage: FormControl = new FormControl('');
  public legalIdentity2ProgressBarValue: number = 0;

  public stripeAccountUpdatableFieldValues: Record<string, string> = {
    "companyName": "",
    "siren": "",
    "headOfficeAddressLine1": "",
    "headOfficeAddressLine2": "",
    "headOfficeAddressPostalCode": "",
    "headOfficeAddressCity": "",
    "birthdate": "",
    "addressLine1": "",
    "addressLine2": "",
    "addressPostalCode": "",
    "addressCity": "",
    "roleInCompany": ""
  }
  public legalIdentity3ModalIsActive: boolean = false;

  // when tos need to be accepted again
  public tosNeedToBeAcceptedAgain: boolean = false;
  public tosModalFormControl: FormControl = new FormControl<boolean>(false);
  public tosModalHelperMessage: string = "";

  // files
  public identityDocumentFrontFile!: File;
  public identityDocumentBackFile!: File;
  public proofOfResidenceFile!: File;
  public proofOfCompanyFile!: File;
  public fileHelpers: Record<string, FormControl> = {
    "identityDocumentFront": new FormControl(''),
    "identityDocumentBack": new FormControl(''),
    "proofOfCompany": new FormControl(''),
    "proofOfResidence": new FormControl('')
  };
  public fileTagFormControls: Record<string, FormControl> = {
    "identityDocumentFront": new FormControl(''),
    "proofOfCompany": new FormControl(''),
    "proofOfResidence": new FormControl('')
  };
  public identityDocumentStatus: "none" | "not_under_verification" | "pending" | "unverified" | "verified" = "none";
  public proofOfResidenceStatus: "none" | "not_under_verification" | "pending" | "unverified" | "verified" = "none";
  public proofOfCompanyStatus: "none" | "not_under_verification" | "pending" | "unverified" | "verified" = "none";
  public fileLabelValues: Record<string, string> = {
    'not_under_verification': 'Vérification non nécessaire pour le moment',
    'pending': 'En cours de vérification',
    'unverified': 'Vérification échouée',
    'verified': 'Vérification réussie'
  }

  // reviews
  public sellerScore: number | null = null;
  public nbReviewsAsSeller: number = 0;
  public buyerScore: number | null = null;
  public nbReviewsAsBuyer: number = 0;

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
    this.legalIdentity0Form = this.formBuilder.group({
      firstname: [''],
      lastname: [''],
      email: [''],
      phoneNumber: [''],
      currentPassword: [''],
      newPassword: ['']
    })

    this.legalIdentity1Form = this.formBuilder.group({
      companyOrIndividualRadio: ['', Validators.required],
      companyName: [''],
      companyStructure: [''],
      capital: [''],
      siren: [''],
      rcs: [''],
      headOfficeAddressLine1: [''],
      headOfficeAddressLine2: [''],
      headOfficeAddressCity: [''],
      headOfficeAddressPostalCode: [''],
      gender: ['Titre de civilité', Validators.required],
      roleInCompany: [''],
      birthdate: [''],
      birthplace: [''],
      citizenship: [''],
      addressLine1: [''],
      addressLine2: [''],
      addressCity: [''],
      addressPostalCode: ['']
    })

    this.legalIdentity2Form = this.formBuilder.group({
      birthdate: [''],
      iban: [''],
      addressLine1: [''],
      addressLine2: [''],
      addressCity: [''],
      addressPostalCode: [''],
      tos: [false]
    })

    this.legalIdentity1Form.get('companyOrIndividualRadio')?.valueChanges
    .subscribe({
      next: value => {
        if (this.legalIdentityLevel >= 3 && value != this.savedBusinessType) {
          this.legalIdentity1Form.get('companyOrIndividualRadio')?.setValue(this.savedBusinessType);
          this.legalIdentity1Status['status'] = backendInteractionStatus.UserError;
          this.updateLegalIdentity1FormMessage.setValue("Une fois que les compléments d'identité ont été renseignés, il n'est plus possible de changer de type de compte.");
        } else {
          this.selectedBusinessType = value;
        }
      },
      error: () => {}
    });

    this.getAccountInformation();
  }



  async getAccountInformation() {
    try {
      let data: Account = await firstValueFrom(this.myAccountService.getAccountInformation());
      this.userId = data.user_id;
  
      this.legalIdentity0Form.get("firstname")?.setValue(data.firstname);
      this.legalIdentity0Form.get("lastname")?.setValue(data.lastname);
      this.legalIdentity0Form.get("email")?.setValue(data.email);
      this.email = data.email;
      this.legalIdentity0Form.get("phoneNumber")?.setValue(data.phone_number);

      if (data.legal_identity) {
        this.legalIdentity1Form.get("companyOrIndividualRadio")?.setValue(data.legal_identity.business_type);
        this.legalIdentity1Form.get("companyOrIndividualRadio")?.disable();
        this.savedBusinessType = data.legal_identity.business_type;
        this.legalIdentityLevel = data.legal_identity.level;

        if (data.legal_identity.gender) {
          this.legalIdentity1Form.get('gender')?.setValue(data.legal_identity.gender);
          this.legalIdentity1Form.get("gender")?.disable();
        }

        if (data.legal_identity.company_structure) {
          this.legalIdentity1Form.get("companyStructure")?.setValue(data.legal_identity.company_structure);
        }

        if (data.legal_identity.company_name) {
          this.legalIdentity1Form.get("companyName")?.setValue(data.legal_identity.company_name);
          this.stripeAccountUpdatableFieldValues["companyName"] = data.legal_identity.company_name;
        }

        if (data.legal_identity.capital) {
          this.legalIdentity1Form.get("capital")?.setValue(data.legal_identity.capital);
        }

        if (data.legal_identity.rcs) {
          this.legalIdentity1Form.get("rcs")?.setValue(data.legal_identity.rcs);
        }

        if (data.legal_identity.siren) {
          this.legalIdentity1Form.get("siren")?.setValue(data.legal_identity.siren);
          this.stripeAccountUpdatableFieldValues["siren"] = data.legal_identity.siren;
        }

        if (data.legal_identity.head_office_address_line1) {
          this.legalIdentity1Form.get("headOfficeAddressLine1")?.setValue(data.legal_identity.head_office_address_line1);
          this.stripeAccountUpdatableFieldValues["headOfficeAddressLine1"] = data.legal_identity.head_office_address_line1;
        }

        if (data.legal_identity.head_office_address_line2) {
          this.legalIdentity1Form.get("headOfficeAddressLine2")?.setValue(data.legal_identity.head_office_address_line2);
          this.stripeAccountUpdatableFieldValues["headOfficeAddressLine2"] = data.legal_identity.head_office_address_line2;
        }

        if (data.legal_identity.head_office_address_postal_code) {
          this.legalIdentity1Form.get("headOfficeAddressPostalCode")?.setValue(data.legal_identity.head_office_address_postal_code);
          this.stripeAccountUpdatableFieldValues["headOfficeAddressPostalCode"] = data.legal_identity.head_office_address_postal_code;
        }

        if (data.legal_identity.head_office_address_city) {
          this.legalIdentity1Form.get("headOfficeAddressCity")?.setValue(data.legal_identity.head_office_address_city);
          this.stripeAccountUpdatableFieldValues["headOfficeAddressCity"] = data.legal_identity.head_office_address_city;
        }

        if (data.legal_identity.role_in_company) {
          this.legalIdentity1Form.get("roleInCompany")?.setValue(data.legal_identity.role_in_company);
          this.stripeAccountUpdatableFieldValues["roleInCompany"] = data.legal_identity.role_in_company;
        }

        if (data.legal_identity.birthdate) {
          this.legalIdentity1Form.get("birthdate")?.setValue(data.legal_identity.birthdate);
          this.legalIdentity2Form.get("birthdate")?.setValue(data.legal_identity.birthdate);
          this.stripeAccountUpdatableFieldValues["birthdate"] = data.legal_identity.birthdate;
        }

        if (data.legal_identity.birthplace) {
          this.legalIdentity1Form.get("birthplace")?.setValue(data.legal_identity.birthplace);
        }

        if(data.legal_identity.citizenship) {
          this.legalIdentity1Form.get("citizenship")?.setValue(data.legal_identity.citizenship);
        }

        if (data.legal_identity.address_line1) {
          this.legalIdentity1Form.get("addressLine1")?.setValue(data.legal_identity.address_line1);
          this.legalIdentity2Form.get("addressLine1")?.setValue(data.legal_identity.address_line1);
          this.stripeAccountUpdatableFieldValues["addressLine1"] = data.legal_identity.address_line1;
        }

        if (data.legal_identity.address_line2) {
          this.legalIdentity1Form.get("addressLine2")?.setValue(data.legal_identity.address_line2);
          this.legalIdentity2Form.get("addressLine2")?.setValue(data.legal_identity.address_line2);
          this.stripeAccountUpdatableFieldValues["addressLine2"] = data.legal_identity.address_line2;
        }

        if (data.legal_identity.address_postal_code) {
          this.legalIdentity1Form.get("addressPostalCode")?.setValue(data.legal_identity.address_postal_code);
          this.legalIdentity2Form.get("addressPostalCode")?.setValue(data.legal_identity.address_postal_code);
          this.stripeAccountUpdatableFieldValues["addressPostalCode"] = data.legal_identity.address_postal_code;
        }

        if (data.legal_identity.address_city) {
          this.legalIdentity1Form.get("addressCity")?.setValue(data.legal_identity.address_city);
          this.legalIdentity2Form.get("addressCity")?.setValue(data.legal_identity.address_city);
          this.stripeAccountUpdatableFieldValues["addressCity"] = data.legal_identity.address_city;
        }

        if (data.legal_identity.iban_last4) {
          let partialIban = "**********************" + data.legal_identity.iban_last4;
          this.legalIdentity2Form.get("iban")?.setValue(partialIban.replace(/(.{4})/g, '$1 ').trim());
          this.legalIdentity2Form.get("iban")?.disable();
        }
      }

      this.userScoreService.getUserScore(this.userId, null, "seller")
      .subscribe({
        next: (userScore: UserScore) => {
          if (userScore.score) {
            this.sellerScore = userScore.score
          }
          if (userScore.nb_reviews) {
            this.nbReviewsAsSeller = userScore.nb_reviews;
          }
        },
        error: () => {}
      })

      this.userScoreService.getUserScore(this.userId, null, "buyer")
      .subscribe({
        next: (userScore: UserScore) => {
          if (userScore.score) {
            this.buyerScore = userScore.score
          }
          if (userScore.nb_reviews) {
            this.nbReviewsAsBuyer = userScore.nb_reviews;
          }
        },
        error: () => {}
      })

      this.myAccountService.getStripeAccount()
      .subscribe({
        next: (data: StripeAccount) => {
          this.identityDocumentStatus = data.identity_document_status;
          this.fileTagFormControls['identityDocumentFront'].setValue(this.fileLabelValues[this.identityDocumentStatus]);
          this.proofOfResidenceStatus = data.proof_of_residence_status;
          this.fileTagFormControls['proofOfResidence'].setValue(this.fileLabelValues[this.proofOfResidenceStatus]);
          if (data.proof_of_company_status) {
            this.proofOfCompanyStatus = data.proof_of_company_status;
            this.fileTagFormControls['proofOfCompany'].setValue(this.fileLabelValues[this.proofOfCompanyStatus]);
          }

          if (
            !data.currently_due_is_empty
            || this.identityDocumentStatus == 'unverified'
            || this.proofOfResidenceStatus == 'unverified'
            || this.proofOfCompanyStatus == 'unverified'
          ) {
            this.userLegalIdentity2Status = "unverified";
          } else if (
            this.identityDocumentStatus == 'pending'
            || this.proofOfResidenceStatus == 'pending'
            || this.proofOfCompanyStatus == 'pending'
          ) {
            this.userLegalIdentity2Status = "pending";
          } else {
            this.userLegalIdentity2Status = "verified";
          }
        },
        error: () => {}
      })
    } catch {

    }
  }

  sendPasswordUpdateEmail() {
    this.myAccountService.sendPasswordUpdateEmail(this.email, this.passwordChangeStatus)
    .subscribe({
      next: () => {
        this.passwordChangeStatus["status"] = backendInteractionStatus.Success;
      },
      error: () => {}
    })
  }

  handleClickReviews(reviewPov: "given" | "received", coverPov: "buyer" | "seller") {
    const url = `/user-reviews?id=${this.userId}&reviewPov=${reviewPov}&coverPov=${coverPov}`;
    window.open(url, '_blank');
  }

  // LEGAL IDENTITES
  askForFormEdit(level: number) {
    if (level == 1) {
      this.legalIdentity1FormLastSavedValue = this.legalIdentity1Form.getRawValue();
      this.legalIdentityForm1IsBeingModified = true;
      this.legalIdentity1Form.get("companyOrIndividualRadio")?.enable();
      this.legalIdentity1Form.get("gender")?.enable();
    } else if (level == 2) {
      this.legalIdentity2FormLastSavedValue = this.legalIdentity2Form.getRawValue();
      this.legalIdentityForm2IsBeingModified = true;
    }
  }

  cancelFormEdition(level: number) {
    if (level == 1) {
      this.legalIdentity1Form.patchValue(this.legalIdentity1FormLastSavedValue);
      this.legalIdentityForm1IsBeingModified = false;
      this.legalIdentity1Form.get("companyOrIndividualRadio")?.setValue(this.savedBusinessType);
      this.legalIdentity1Form.get("companyOrIndividualRadio")?.disable();
      this.legalIdentity1Form.get("gender")?.disable();
    } else if (level == 2) {
      this.legalIdentity2Form.patchValue(this.legalIdentity2FormLastSavedValue);
      this.legalIdentityForm2IsBeingModified = false;
    }
  }

  handleLegalIdentity1Click() {
    if (this.legalIdentityLevel < 3) {
      try {
        this.checkUserErrorLegalIdentity1()
      } catch {
        return
      }
      this.saveLegalIdentity1();
    } else {
      const legalIdentity1FormValue = this.legalIdentity1Form.getRawValue();
      if (legalIdentity1FormValue["siren"] != this.stripeAccountUpdatableFieldValues["siren"]) {
        this.tosNeedToBeAcceptedAgain = true;
      }

      if (this.userLegalIdentity2Status == "verified" || this.tosNeedToBeAcceptedAgain) {
        this.legalIdentity1ModalIsActive = true;
      } else {
        this.confirmLegalIdentity1Modal();
      }

    }
  }

  async confirmLegalIdentity1Modal() {
    // when tos need to be accepted again
    if (this.tosNeedToBeAcceptedAgain) {
      const value = this.tosModalFormControl.getRawValue();
      if (value) {
        this.tosModalHelperMessage = "";
        this.tosNeedToBeAcceptedAgain = false;
      } else {
        this.tosModalHelperMessage = "Vous devez cocher la case ci-dessus."
        return
      }
    }
    this.updateLegalIdentity1FormMessage.setValue("");
    this.legalIdentity1Status['status'] = backendInteractionStatus.Loading;
    this.legalIdentity1ModalIsActive = false;
    try {
      this.checkUserErrorLegalIdentity1()
    } catch {
      return
    }
    try {
      await this.updateStripeAccountForLegalIdentity1();
    } catch {
      this.triggerBackendError("1");
      return
    }
    this.saveLegalIdentity1();
  }

  checkUserErrorLegalIdentity1() {
    if (!this.legalIdentity1Form.valid) {
      this.legalIdentity1Status['status'] = backendInteractionStatus.UserError;
      this.updateLegalIdentity1FormMessage.setValue("Tous les champs du formulaire suivis d'un astérisque (*) doivent être remplis.");
      throw new Error();
    }

    const legalIdentity1FormValue = this.legalIdentity1Form.getRawValue();
    if (this.selectedBusinessType == "company") {
      if (
        legalIdentity1FormValue["gender"] == "Titre de civilité"
        || legalIdentity1FormValue["companyName"] == ""
        || legalIdentity1FormValue["companyStructure"] == ""
        || legalIdentity1FormValue["capital"] == ""
        || legalIdentity1FormValue["siren"] == ""
        || legalIdentity1FormValue["headOfficeAddressLine1"] == ""
        || legalIdentity1FormValue["headOfficeAddressCity"] == ""
        || legalIdentity1FormValue["headOfficeAddressPostalCode"] == ""
        || legalIdentity1FormValue["roleInCompany"] == ""
      ) {
        this.legalIdentity1Status['status'] = backendInteractionStatus.UserError;
        this.updateLegalIdentity1FormMessage.setValue("Tous les champs du formulaire suivis d'un astérisque (*) doivent être remplis.");
        throw new Error();
      }
    } else if (this.selectedBusinessType == "individual") {
      if (
        legalIdentity1FormValue["gender"] == "Titre de civilité"
        || legalIdentity1FormValue["birthdate"] == ""
        || legalIdentity1FormValue["birthplace"] == ""
        || legalIdentity1FormValue["citizenship"] == ""
        || legalIdentity1FormValue["addressLine1"] == ""
        || legalIdentity1FormValue["addressCity"] == ""
        || legalIdentity1FormValue["addressPostalCode"] == ""
      ) {
        this.legalIdentity1Status['status'] = backendInteractionStatus.UserError;
        this.updateLegalIdentity1FormMessage.setValue("Tous les champs du formulaire suivis d'un astérisque (*) doivent être remplis.");
        throw new Error();
      }
    }
  }

  saveLegalIdentity1() {
    this.legalIdentity1Status['status'] = backendInteractionStatus.Loading;
    this.myAccountService.putLegalIdentity1(
      this.selectedBusinessType,
      this.legalIdentity1Form.getRawValue(),
      this.legalIdentity1Status,
      this.updateLegalIdentity1FormMessage
    ).subscribe({
      next: (response: PutLegalIdentityResponse) => {
        this.updateLegalIdentity1FormMessage.setValue("Les informations ont bien été sauvegardées.")
        this.savedBusinessType = this.selectedBusinessType;
        this.legalIdentity1Status['status'] = backendInteractionStatus.Success;
        this.legalIdentityForm1IsBeingModified = false;
        this.legalIdentityLevel = response.new_level;
        this.legalIdentity1Form.get("companyOrIndividualRadio")?.disable();
        this.legalIdentity1Form.get("gender")?.disable();
      },
      error: () => {}
    })
  }

  parseIBAN() {
    let value = this.legalIdentity2Form.value.iban;
    if (value) {
      value = value.toUpperCase().replace(/ /g, '').slice(0, 27);
      this.legalIdentity2Form.get('iban')?.setValue(value.replace(/(.{4})/g, '$1 ').trim());
    }
  }

  triggerBackendError(form: "1" | "2") {
    if (form == "2") {
      this.legalIdentity2Status['status'] = backendInteractionStatus.BackendError;
      this.updateLegalIdentity2FormMessage.setValue("Une erreur est survenue. C'est probablement de notre côté. Veuillez réessayer s'il vous plaît.");
    } else {
      this.legalIdentity1Status['status'] = backendInteractionStatus.BackendError;
      this.updateLegalIdentity1FormMessage.setValue("Une erreur est survenue. C'est probablement de notre côté. Veuillez réessayer s'il vous plaît.");
    }
  }

  handleLegalIdentity2Click() {
    if (this.legalIdentityLevel < 3) {
      this.openLegalIdentity2Modal();
    } else if (this.userLegalIdentity2Status == "verified") {
      this.legalIdentity3ModalIsActive = true;
    } else {
      this.confirmLegalIdentity2Modal();
    }
  }

  async confirmLegalIdentity2Modal() {
    this.updateLegalIdentity2FormMessage.setValue("");
    this.legalIdentity2Status['status'] = backendInteractionStatus.Loading;
    this.legalIdentity3ModalIsActive = false;
    try {
      await this.updateStripeAccountForLegalIdentity2();
    } catch {
      this.triggerBackendError("2");
      return
    }

    // put legal identity 2 if company
    if (this.selectedBusinessType == "company") {
      const legalIdentity2FormValue = this.legalIdentity2Form.getRawValue();
      try {
        const response = await firstValueFrom(
          this.myAccountService.putLegalIdentity2(
            this.selectedBusinessType,
            legalIdentity2FormValue,
            this.legalIdentity2Status,
            this.updateLegalIdentity2FormMessage
            )
        )
        this.legalIdentityLevel = response.new_level;
      } catch {
        this.triggerBackendError("2");
        return
      }
    }
    this.legalIdentityForm2IsBeingModified = false;
    this.updateLegalIdentity2FormMessage.setValue('Informations enregistrées avec succès.');
    this.legalIdentity2Status['status'] = backendInteractionStatus.Success;
  }

  async saveLegalIdentity2() {
    this.legalIdentity2ModalIsActive = false;
    this.updateLegalIdentity2FormMessage.setValue('');
    this.legalIdentity2Status['status'] = backendInteractionStatus.Loading;
  
    const legalIdentity0FormValue = this.legalIdentity0Form.getRawValue();
    const legalIdentity1FormValue = this.legalIdentity1Form.getRawValue();
    const legalIdentity2FormValue = this.legalIdentity2Form.getRawValue();

    let accountToken = null;
    let personToken = null;
    let companyRemainingInfoAccountToken = null;

    this.legalIdentity2ProgressBarValue = 0;

    // COMPANY ===============================
    if (this.selectedBusinessType == "company") {
      try {
        const response = await firstValueFrom(
          this.myAccountService.putLegalIdentity2(
            this.selectedBusinessType,
            legalIdentity2FormValue,
            this.legalIdentity2Status,
            this.updateLegalIdentity2FormMessage
            )
        )
        this.legalIdentityLevel = response.new_level;
      } catch {
        return
      }
      this.legalIdentity2ProgressBarValue = 3;

      // proof of company file
      let proofOfCompanyId = null;
      try {
        const proofOfCompanyRequestResult = await firstValueFrom(
          this.myAccountService.sendFileToStripe('additional_verification', this.proofOfCompanyFile)
        );
        proofOfCompanyId = proofOfCompanyRequestResult.id;
      } catch {
        this.triggerBackendError("2");
        return
      }
      this.legalIdentity2ProgressBarValue = 6;

      // account, with proof of company id
      try {
        const accountResult = await this.myAccountService.createStripeAccountTokenForCompany(
          legalIdentity0FormValue,
          legalIdentity1FormValue,
          proofOfCompanyId
        );
        accountToken = accountResult?.token?.id;
      } catch {
        this.triggerBackendError("2");
        return
      }
      this.legalIdentity2ProgressBarValue = 13;

      // identity and proof of residence files
      let identityDocumentFrontId = null;
      try {
        const identityDocumentFrontRequestResult = await firstValueFrom(
          this.myAccountService.sendFileToStripe('identity_document', this.identityDocumentFrontFile)
        );
        identityDocumentFrontId = identityDocumentFrontRequestResult.id
      } catch {
        this.triggerBackendError("2");
        return
      }
      this.legalIdentity2ProgressBarValue = 18;

      let identityDocumentBackId = null;
      if (this.identityDocumentBackFile) {
        try {
          const identityDocumentBackRequestResult = await firstValueFrom(
            this.myAccountService.sendFileToStripe('identity_document', this.identityDocumentBackFile)
          );
          identityDocumentBackId = identityDocumentBackRequestResult.id
        } catch {
          this.triggerBackendError("2");
          return
        }
      }
      this.legalIdentity2ProgressBarValue = 22;

      let proofOfResidenceId = null;
      try {
        const proofOfResidenceRequestResult = await firstValueFrom(
          this.myAccountService.sendFileToStripe('additional_verification', this.proofOfResidenceFile)
        );
        proofOfResidenceId = proofOfResidenceRequestResult.id
      } catch {
        this.triggerBackendError("2");
        return
      }
      this.legalIdentity2ProgressBarValue = 26;

      // create person token
      try {
        const personResult = await this.myAccountService.createStripePersonToken(
          legalIdentity0FormValue,
          legalIdentity1FormValue,
          legalIdentity2FormValue,
          identityDocumentFrontId,
          identityDocumentBackId,
          proofOfResidenceId
        );
        const personTokenValue = personResult?.token?.id
        if (personTokenValue) {
          personToken = personTokenValue;
        }
      } catch {
        this.triggerBackendError("2");
        return
      }
      this.legalIdentity2ProgressBarValue = 30;

      // create company remaining info account token
      try {
        const accountResult = await this.myAccountService.createStripeAccountTokenForCompanyRemainingInfo();
        const companyRemainingInfoAccountTokenValue = accountResult?.token?.id;
        if (companyRemainingInfoAccountTokenValue) {
          companyRemainingInfoAccountToken = companyRemainingInfoAccountTokenValue;
        }
      } catch {
        this.triggerBackendError("2");
        return
      }
      this.legalIdentity2ProgressBarValue = 30;

      // INDIVIDUAL ====================================
    } else if (this.selectedBusinessType == "individual") {

      // identity and proof of residence files
      let identityDocumentFrontId = null;
      try {
        const identityDocumentFrontRequestResult = await firstValueFrom(
          this.myAccountService.sendFileToStripe('identity_document', this.identityDocumentFrontFile)
        );
        identityDocumentFrontId = identityDocumentFrontRequestResult.id
      } catch {
        this.triggerBackendError("2");
        return
      }
      this.legalIdentity2ProgressBarValue = 8;

      let identityDocumentBackId = null;
      if (this.identityDocumentBackFile) {
        try {
          const identityDocumentBackRequestResult = await firstValueFrom(
            this.myAccountService.sendFileToStripe('identity_document', this.identityDocumentBackFile)
          );
          identityDocumentBackId = identityDocumentBackRequestResult.id
        } catch {
          this.triggerBackendError("2");
          return
        }
      }
      this.legalIdentity2ProgressBarValue = 15;

      let proofOfResidenceId = null;
      try {
        const proofOfResidenceRequestResult = await firstValueFrom(
          this.myAccountService.sendFileToStripe('additional_verification', this.proofOfResidenceFile)
        );
        proofOfResidenceId = proofOfResidenceRequestResult.id
      } catch {
        this.triggerBackendError("2");
        return
      }
      this.legalIdentity2ProgressBarValue = 22;

      try {
        const accountResult = await this.myAccountService.createStripeAccountTokenForIndividual(
          legalIdentity0FormValue,
          legalIdentity1FormValue,
          identityDocumentFrontId,
          identityDocumentBackId,
          proofOfResidenceId
        );
        accountToken = accountResult?.token?.id;
      } catch {
        this.triggerBackendError("2");
        return
      }
      this.legalIdentity2ProgressBarValue = 28;
    }

    // create bank account token
    let bankAccountToken = null;
    try {
      const bankAccountResult = await this.myAccountService.createBankAccountToken(
        legalIdentity0FormValue,
        legalIdentity1FormValue,
        legalIdentity2FormValue,
        this.selectedBusinessType
      );
      bankAccountToken = bankAccountResult?.token?.id;
    } catch  {
      this.triggerBackendError("2");
      return
    }
    this.legalIdentity2ProgressBarValue = 33;

    if (!accountToken
      || ((!personToken || !companyRemainingInfoAccountToken) && this.selectedBusinessType == "company")
      || !bankAccountToken) {
      this.triggerBackendError("2");
      return
    }

    if (this.selectedBusinessType == "company") {
      setTimeout(() => {
        this.legalIdentity2ProgressBarValue = 66;
      }, 5000)
    } else {
      setTimeout(() => {
        this.legalIdentity2ProgressBarValue = 66;
      }, 2500)
    }

    this.myAccountService.createStripeAccount(
      accountToken,
      personToken,
      companyRemainingInfoAccountToken,
      bankAccountToken,
      this.selectedBusinessType,
      this.legalIdentity2Status,
      this.updateLegalIdentity2FormMessage
    ).subscribe({
      error: () => {},
      complete: () => {
        this.legalIdentity2ProgressBarValue = 100;
        this.updateLegalIdentity2FormMessage.setValue('Informations enregistrées avec succès.');
        this.getAccountInformation()
        .then(() => {
          this.legalIdentityForm2IsBeingModified = false;
          this.legalIdentity2Status['status'] = backendInteractionStatus.Success;
        });
      }
    })
  }

  async updateStripeAccountForLegalIdentity1() {
    const legalIdentity1FormValue = this.legalIdentity1Form.getRawValue();
    let accountToken = null;
    let personToken = null;

    if (this.selectedBusinessType == "company") {
      // account token
      const accountResult = await this.myAccountService.createPartialStripeAccountTokenForCompany1(
        legalIdentity1FormValue,
        this.stripeAccountUpdatableFieldValues
      )
      if (accountResult?.error) {
        throw new Error();
      }
      accountToken = accountResult?.token?.id;

      // person token
      const personResult = await this.myAccountService.createPartialStripePersonToken1(
        legalIdentity1FormValue,
        this.stripeAccountUpdatableFieldValues
      )
      if (personResult?.error) {
        throw new Error();
      }
      personToken = personResult?.token?.id;

    } else if (this.selectedBusinessType == "individual") {
      // account token
      const accountResult = await this.myAccountService.createPartialStripeAccountTokenForIndividual1(
        legalIdentity1FormValue,
        this.stripeAccountUpdatableFieldValues
      )
      if (accountResult?.error) {
        throw new Error();
      }
      accountToken = accountResult?.token?.id;
    }

    if (accountToken || personToken) {
      await firstValueFrom(this.myAccountService.putStripeAccount(accountToken, personToken))
    }
  }

  async updateStripeAccountForLegalIdentity2() {
    const legalIdentity2FormValue = this.legalIdentity2Form.getRawValue();
    let accountToken = null;
    let personToken = null;

    // whether business type is company or individual, id documents or proof of residence may be reuploaded
    let identityDocumentFrontId = null;
    if (this.identityDocumentStatus == 'unverified' && this.identityDocumentFrontFile) {
      const identityDocumentFrontRequestResult = await firstValueFrom(
        this.myAccountService.sendFileToStripe('identity_document', this.identityDocumentFrontFile)
      );
      identityDocumentFrontId = identityDocumentFrontRequestResult.id
    }

    let identityDocumentBackId = null;
    if (this.identityDocumentStatus == 'unverified' && this.identityDocumentBackFile) {
      const identityDocumentBackRequestResult = await firstValueFrom(
        this.myAccountService.sendFileToStripe('identity_document', this.identityDocumentBackFile)
      );
      identityDocumentBackId = identityDocumentBackRequestResult.id
    }

    let proofOfResidenceId = null;
    if (this.proofOfResidenceStatus == 'unverified' && this.proofOfResidenceFile) {
      const proofOfResidenceRequestResult = await firstValueFrom(
        this.myAccountService.sendFileToStripe('additional_verification', this.proofOfResidenceFile)
      );
      proofOfResidenceId = proofOfResidenceRequestResult.id
    }

    if (this.selectedBusinessType == "company") {
      // proof of company if needed
      let proofOfCompanyId = null;
      if (this.proofOfCompanyStatus == 'unverified' && this.proofOfCompanyFile) {
        const proofOfCompanyRequestResult = await firstValueFrom(
          this.myAccountService.sendFileToStripe('additional_verification', this.proofOfCompanyFile)
        );
        proofOfCompanyId = proofOfCompanyRequestResult.id;
      }

      // account token
      const accountResult = await this.myAccountService.createPartialStripeAccountTokenForCompany2(proofOfCompanyId);
      if (accountResult?.error) {
        throw new Error();
      }
      accountToken = accountResult?.token?.id;

      // person token
      const personResult = await this.myAccountService.createPartialStripePersonToken2(
        legalIdentity2FormValue,
        this.stripeAccountUpdatableFieldValues,
        identityDocumentFrontId,
        identityDocumentBackId,
        proofOfResidenceId
      )
      if (personResult?.error) {
        throw new Error();
      }
      personToken = personResult?.token?.id;

    } else if (this.selectedBusinessType == "individual") {
      // account token
      const accountResult = await this.myAccountService.createPartialStripeAccountTokenForIndividual2(
        identityDocumentFrontId,
        identityDocumentBackId,
        proofOfResidenceId
      )
      if (accountResult?.error) {
        throw new Error();
      }
      accountToken = accountResult?.token?.id;
    }
    if (accountToken || personToken) {
      await firstValueFrom(this.myAccountService.putStripeAccount(accountToken, personToken))
    }
  }

  fetchFile(event: any, type: "identityDocumentFront" | "identityDocumentBack" | "proofOfCompany" | "proofOfResidence") {
    Object.keys(this.fileHelpers).forEach((type: any) => {
      this.fileHelpers[type].setValue('');
    })

    const file: File = event.target.files[0];
    if (!file) {
      return
    }

    if (file.size > stripeFilesMaxSizeInBytes) {
      this.fileHelpers[type].setValue('La taille du fichier doit être inférieure à 10 Mo. Celle du fichier sélectionné les dépasse.');
      return
    } 

    if (type == "identityDocumentFront") {
      this.identityDocumentFrontFile = file;
    } else if (type == "identityDocumentBack") {
      this.identityDocumentBackFile = file;
    } else if (type == "proofOfCompany") {
      this.proofOfCompanyFile = file;
    } else if (type == "proofOfResidence") {
      this.proofOfResidenceFile = file;
    }
    this.fileHelpers[type].setValue('');
  }

  // DELETE ACCOUNT
  deleteAccount() {
    const value = this.accountDeletionInputFormControl.getRawValue();
    if (value != "Supprimer mon compte") {
      this.accountDeletionModalHelperMessage = "Il semble y avoir une faute dans la phrase de confirmation."
    } else {
      this.accountDeletionModalHelperMessage = "";
      this.accountDeletionStatus['status'] = backendInteractionStatus.Loading;
      this.closeModal();
      this.myAccountService.deleteAccount(value, this.accountDeletionStatus, this.accountDeletionInputFormControl)
      .subscribe({
        next: () => {
          this.accountDeletionStatus['status'] = backendInteractionStatus.Success;
          this.authService.disconnectUser();
        },
        error: () => {}
      })
    }
  }

  // MODALS
  openAccountDeletionModal() {
    this.accountDeletionModalIsActive = true;
  }

  openLegalIdentity2Modal() {
    this.updateLegalIdentity2FormMessage.setValue("");

    if (this.legalIdentityForm1IsBeingModified) {
      this.legalIdentity2Status['status'] = backendInteractionStatus.UserError;
      this.updateLegalIdentity2FormMessage.setValue(
        "Vous devez d'abord terminer d'enregistrer les modifications du complément d'identité de niveau 1, ou bien les annuler."
      );
      return
    }

    const legalIdentity2FormValue = this.legalIdentity2Form.getRawValue();

    if (this.selectedBusinessType == "company") {
      if (
        legalIdentity2FormValue["birthdate"] == ""
        || legalIdentity2FormValue["iban"] == ""
        || legalIdentity2FormValue["addressLine1"] == ""
        || legalIdentity2FormValue["addressCity"] == ""
        || legalIdentity2FormValue["addressPostalCode"] == ""
        || !this.proofOfCompanyFile
        || !this.proofOfResidenceFile
        || !this.identityDocumentFrontFile
      ) {
        this.legalIdentity2Status['status'] = backendInteractionStatus.UserError;
        this.updateLegalIdentity2FormMessage.setValue("Tous les champs du formulaire suivis d'un astérisque (*) doivent être remplis.");
        return
      }
    }

    if (!this.legalIdentity2Form.get('tos')?.value) {
      this.legalIdentity2Status['status'] = backendInteractionStatus.UserError;
      this.updateLegalIdentity2FormMessage.setValue(
        "Vous devez accepter les Conditions d'Utilisation des Comptes Connectés Stripe, en cochant la case ci-dessus."
      );
      return
    }

    this.legalIdentity2ModalIsActive = true;
  }

  closeModal() {
    this.legalIdentity1ModalIsActive = false;
    this.legalIdentity2ModalIsActive = false;
    this.accountDeletionModalIsActive = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }
}
