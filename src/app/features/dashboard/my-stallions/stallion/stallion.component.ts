import { Component, Input, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PostStallionOwnerResponse, PostStallionResponse, StallionOwnerItem, StallionOwners, StallionService } from './stallion.service';
import { getAvailableBreeds, breedsRecord, availableCoverTypes, coverPlaceNames, getNumberArray, photosMaxSizeInBytes, splitListOrKeysList, balancePaymentConditions, stds, vaccines, objectStorageBaseUrl, photosPrefix, backendInteractionStatus, backendBaseUrl, verificationFileMaxSizeInBytes } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GeolocationService, getCityData, getCityItem } from 'src/app/core/geolocation/geolocation.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

export interface StallionComponentInput {
  mode: 'edition' | 'creation';
  stallionId: string | null;
}

@Component({
  selector: 'app-stallion',
  templateUrl: './stallion.component.html',
  styleUrls: ['./stallion.component.css'],
  providers: [
    StallionService,
    GeolocationService
  ]
})
export class StallionComponent implements OnInit {

  @Input() stallionComponentInput: StallionComponentInput = {
    mode: 'creation',
    stallionId: null
  };

  // imported variables and functions
  public breedsRecord = breedsRecord;
  public availableBreedTypes = Object.keys(breedsRecord);
  public availableBreeds = getAvailableBreeds();
  public availableCoverTypes = availableCoverTypes;
  public coverPlaceNames = coverPlaceNames;
  public photosMaxSizeInBytes = photosMaxSizeInBytes;
  public verificationFileMaxSizeInBytes = verificationFileMaxSizeInBytes;
  public getNumberArray = getNumberArray;
  public splitListOrKeysList = splitListOrKeysList;
  public balancePaymentConditions = balancePaymentConditions;
  public stdsRecord = stds;
  public vaccinesRecord = vaccines;
  public availableStds = Object.keys(this.stdsRecord);
  public availableVaccines = Object.keys(this.vaccinesRecord);
  public objectStorageBaseUrl = objectStorageBaseUrl;
  public photosPrefix = photosPrefix;

  // helpers
  public submitHelper: FormControl = new FormControl('');
  public photosHelper: FormControl= new FormControl('');
  public verificationFileHelper: FormControl= new FormControl('');
  public locationHelper: FormControl = new FormControl('');
  public birthdateHelper: FormControl = new FormControl('');
  public stallionOwnersFormHelper: FormControl = new FormControl('');

  // form validation status
  public stallionFormStatus: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};
  public locationSearchSuccess: Record<string, boolean> = {status: false};
  public stallionOwnersFormPostPutStatus: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};
  public stallionOwnersFormDeleteStatus: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};

  // form booleans
  public isLookingForLocation: boolean = false;
  public locationIsValidated: boolean = false;
  public stallionHasUnregisteredBreed: boolean = false;
  public stallionHasUnregisteredProductionBreeds: boolean = false;
  public displayStallionOwnerForm: boolean = false;

  // form variables
  public coverTypes: Record<string, boolean> = {};
  public productionBreeds: Record<string, boolean> = {};
  public stallionStdNegativeTests: Record<string, boolean> = {};
  public stallionVaccines: Record<string, boolean> = {};
  public verificationFile!: File;
  public photos: Array<File | null> = [];
  public mareSTDs: Record<string, Record<string, boolean>> = {};
  public mareVaccines: Record<string, Record<string, boolean>> = {};
  public availableStallionOwnerIds: Array<string> = [];
  public stallionOwnerIdToName: Record<string, string> = {'handler': 'Moi'}
  public availableStallionOwners: Record<string, StallionOwnerItem> = {};

  // modal booleans
  public deleteStallionOwnerModalIsActive: boolean = false;

  // tools variables
  public title: 'Ajouter un nouvel étalon' | "Éditer le profil d'un étalon" = 'Ajouter un nouvel étalon';
  public photosURLs: SafeUrl[] = [];
  public locations: getCityItem[] = [];
  public locationTagValues: string[] = [];
  public selectedLocation: getCityItem = {
    city: "",
    postal_code: "",
    lat: 0,
    lng: 0
  };
  public geolocationInputTimer: any;
  public geolocStatus: Record<string, backendInteractionStatus> = {"status": backendInteractionStatus.Init};
  public displayGeolocDd: boolean = false;
  public productionBreedsAddedByHand: Array<string> = [];
  public saveButtonIsDisabled: boolean = false;
  public stallionOwnersFormIsBeingModified: boolean = false;
  public aStallionOwnerIsBeingCreated: boolean = false;
  public stallionOwnersFormLastSavedValue: any;
  public savedStallionOwnerBusinessType: string = "";
  public selectedStallionOwnerBusinessType: string = "";

  // only when editing
  public keptPhotos: Array<number> = [];

  // form values variables
  public stallionForm!: FormGroup;
  public stallionOwnersForm!: FormGroup;

  constructor(
    private stallionService: StallionService,
    private geolocationService: GeolocationService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private router: Router
    ) {}

  async ngOnInit() {
    this.stallionComponentInput.mode === 'edition' ? this.title = "Éditer le profil d'un étalon" : this.title = "Ajouter un nouvel étalon";

    this.stallionForm = this.formBuilder.group({
      name: ['', Validators.required],
      breed: ['Sélectionner', Validators.required],
      nSIRE: ['', Validators.required],
      mainDesc: ['', Validators.required],
      color: ['', Validators.required],
      height: ['', Validators.required],
      birthdate: ['', Validators.required],
      p1: '',
      p2: '',
      p3: '',
      p4: '',
      p5: '',
      p6: '',
      p7: '',
      p8: '',
      p9: '',
      p10: '',
      p11: '',
      p12: '',
      p13: '',
      p14: '',
      coverAdditionalInfo: '',
      performance: '',
      pedigreePO: '',
      stallionAdditionalInfo: '',
      offspring: '',
      crossbreedingAdvice: '',
      location: ['', Validators.required],
      newProductionBreed: '',
      stallionOwner: ['Sélectionner', Validators.required]
    })

    this.stallionOwnersForm = this.formBuilder.group({
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
      addressPostalCode: [''],
      firstname: [''],
      lastname: ['']
    })

    for (const std of this.availableStds) {
      this.stallionForm.addControl(std + 'StallionTestDate', new FormControl(''));
      this.stallionForm.get(std + 'StallionTestDate')?.disable();
    }

    for (const coverType of Object.keys(this.availableCoverTypes)) {
      this.stallionForm.addControl(coverType + 'Price', new FormControl(''));
      this.stallionForm.addControl(coverType + 'BalancePaymentCondition', new FormControl(''));
      this.stallionForm.addControl(coverType + 'AdvancePercentage', new FormControl(''));

      this.stallionForm.addControl(coverType + 'CoverPlace', new FormControl(''));
      this.stallionForm.addControl(coverType + 'MaximumNumberOfAttempts', new FormControl(''));

      this.mareSTDs[coverType] = {}
      for (const std of this.availableStds) {
        this.stallionForm.addControl(coverType + std + 'MareTestOldness', new FormControl(''));
        this.stallionForm.get(coverType + std + 'MareTestOldness')?.disable();
        this.mareSTDs[coverType][std] = false;
      }

      for (const vaccine of this.availableVaccines) {
        this.mareVaccines[coverType] = {vaccine: false};
      }

      this.coverTypes[coverType] = false;
    }

    this.stallionForm.get('stallionOwner')?.valueChanges.subscribe((value) => {
      this.stallionOwnersFormHelper.setValue("");
      if (this.stallionOwnersFormIsBeingModified) {
        this.cancelStallionOwnersFormEdition();
      }

      if (value == 'Ajouter un propriétaire') {
        this.stallionOwnersForm.get('companyOrIndividualRadio')?.enable();
        this.stallionOwnersForm.get('gender')?.enable();
        this.displayStallionOwnerForm = true;
        this.aStallionOwnerIsBeingCreated = true;
      } else if (['Sélectionner', 'Moi'].includes(value)){
        this.displayStallionOwnerForm = false;
        this.aStallionOwnerIsBeingCreated = false;
      } else {
        this.stallionOwnersForm.get('companyOrIndividualRadio')?.disable();
        this.stallionOwnersForm.get('gender')?.disable();
        this.displayStallionOwnerForm = true;
        this.aStallionOwnerIsBeingCreated = false;
        this.assignStallionOwnerDataToForm(value);
      }
    })

    this.stallionOwnersForm.get('companyOrIndividualRadio')?.valueChanges
    .subscribe({
      next: value => {
        this.selectedStallionOwnerBusinessType = value;
      },
      error: () => {}
    });

    await this.getStallionOwners();

    if (this.stallionComponentInput.mode === 'edition') {
      this.fetchStallionProfile();
    }
  }

  fetchStallionProfile() {
    if (this.stallionComponentInput.stallionId) {
      this.stallionService.fetchStallionProfile(this.stallionComponentInput.stallionId)
      .subscribe({
        next: (data: any) => {
          this.stallionForm.get('name')?.setValue(data.name);
          this.stallionForm.get('name')?.disable();
          this.stallionForm.get('breed')?.setValue(data.breed);
          this.stallionForm.get('breed')?.disable();
          this.stallionForm.get('nSIRE')?.setValue(data.n_sire);
          this.stallionForm.get('nSIRE')?.disable();
          this.stallionForm.get('stallionOwner')?.setValue(data.stallion_owner_id);
          this.stallionOwnersForm.get('gender')?.disable();

          data.photos.forEach((url: string) => {
            this.photosURLs.push(objectStorageBaseUrl + photosPrefix + '/' + url);
            this.photos.push(null);
          })
          this.keptPhotos = getNumberArray(data.photos.length);

          this.stallionForm.get('mainDesc')?.setValue(data.main_desc);
          this.stallionForm.get('color')?.setValue(data.color);
          this.stallionForm.get('height')?.setValue(data.height);
          this.stallionForm.get('birthdate')?.setValue(data.birthdate);
          this.stallionForm.get('birthdate')?.disable();

          for (let [index, parent] of data.pedigree.entries()) {
            this.stallionForm.get('p' + (index + 1).toString())?.setValue(parent);
          }

          this.locationSearchSuccess['status'] = true;
          this.stallionForm.get('location')?.setValue(data.city + ' (' + data.postal_code + ')');
          this.locationIsValidated = true;
          this.selectedLocation.city = data.city;
          this.selectedLocation.postal_code = data.postal_code;
          this.selectedLocation.lat = data.lat;
          this.selectedLocation.lng = data.lng;

          this.stallionForm.get('crossbreedingAdvice')?.setValue(data.crossbreeding_advice);

          for (let vaccine of data.stallion_vaccines) {
            this.stallionVaccines[vaccine] = true;
          }

          for (let std of this.availableStds) {
            if (data.stallion_std_negative_tests[std]) {
              this.stallionStdNegativeTests[std] = true;
              this.stallionForm.get(std + 'StallionTestDate')?.setValue(data.stallion_std_negative_tests[std]["test_date"]);
              this.stallionForm.get(std + 'StallionTestDate')?.enable();
            }
          }

          this.stallionForm.get('offspring')?.setValue(data.offspring);
          this.stallionForm.get('performance')?.setValue(data.performance);
          this.stallionForm.get('pedigreePO')?.setValue(data.pedigree_po);
          this.stallionForm.get('stallionAdditionalInfo')?.setValue(data.stallion_additional_info);

          for (let productionBreed of data.production_breeds) {
            if (this.availableBreeds.includes(productionBreed)) {
              this.productionBreeds[productionBreed] = true;
            } else {
              this.triggerOtherProductionBreeds();
              this.productionBreedsAddedByHand.push(productionBreed);
            }
          }

          for (let coverType of Object.keys(this.availableCoverTypes)) {
            if (data.cover_specs[coverType]) {
              this.coverTypes[coverType] = true;
              this.stallionForm.get(coverType + 'Price')?.setValue(data.cover_specs[coverType].price);
              this.stallionForm.get(coverType + 'BalancePaymentCondition')?.setValue(data.cover_specs[coverType].balance_payment_condition);
              this.stallionForm.get(coverType + 'AdvancePercentage')?.setValue(data.cover_specs[coverType].advance_percentage);

              this.stallionForm.get(coverType + 'CoverPlace')?.setValue(data.cover_specs[coverType].cover_place);
              this.stallionForm.get(coverType + 'MaximumNumberOfAttempts')?.setValue(data.cover_specs[coverType].maximum_nb_of_attempts);

              for (let vaccine of data.cover_specs[coverType].demanded_vaccines) {
                this.mareVaccines[coverType][vaccine] = true;
              }

              for (let std of this.availableStds) {
                if (data.cover_specs[coverType].demanded_std_negative_tests[std]) {
                  this.stallionForm.get(coverType + std + 'MareTestOldness')?.setValue(data.cover_specs[coverType].demanded_std_negative_tests[std].test_oldness);
                  this.stallionForm.get(coverType + std + 'MareTestOldness')?.enable();
                  this.mareSTDs[coverType][std] = true;
                }
              }

              this.stallionForm.get('coverAdditionalInfo')?.setValue(data.cover_additional_info);
            }
          }
        },
        error: () => {}
      })
    }
  }

  // stallion owners
  async getStallionOwners() {
    try {
      const data: StallionOwners = await firstValueFrom(this.stallionService.getStallionOwners())
      for (let item of data.stallion_owners) {
        const nameInSelect = item.firstname + ' ' + item.lastname;
        this.availableStallionOwnerIds.push(item.id);
        this.stallionOwnerIdToName[item.id] = nameInSelect;
        this.availableStallionOwners[item.id] = item;
      }
    } catch {

    }
  }

  createStallionOwnerItemFromForm(id: string, formValue: any, businessType: string) {
    let stallionOwnerItem: StallionOwnerItem = {
      id: id,
      business_type: businessType,
      firstname: formValue['firstname'],
      lastname: formValue['lastname'],
      gender: formValue['gender'],
      company_structure: formValue['companyStructure'],
      company_name: formValue['companyName'],
      capital: formValue['capital'],
      rcs: formValue['rcs'],
      siren: formValue['siren'],
      head_office_address_line1: formValue['headOfficeAddressLine1'],
      head_office_address_line2: formValue['headOfficeAddressLine2'],
      head_office_address_postal_code: formValue['headOfficeAddressPostalCode'],
      head_office_address_city: formValue['headOfficeAddressCity'],
      role_in_company: formValue['roleInCompany'],
      birthdate: formValue['birthdate'],
      birthplace: formValue['birthplace'],
      citizenship: formValue['citizenship'],
      address_line1: formValue['addressLine1'],
      address_line2: formValue['addressLine1'],
      address_postal_code: formValue['addressPostalCode'],
      address_city: formValue['addressCity']
    }

    return stallionOwnerItem;
  }

  assignStallionOwnerDataToForm(id: string) {
    const item = this.availableStallionOwners[id];

    this.stallionOwnersForm.get("companyOrIndividualRadio")?.setValue(item.business_type);
    this.stallionOwnersForm.get("companyOrIndividualRadio")?.disable();
    this.stallionOwnersForm.get('firstname')?.setValue(item.firstname);
    this.stallionOwnersForm.get('lastname')?.setValue(item.lastname);
    this.stallionOwnersForm.get('gender')?.setValue(item.gender);
    if (item.company_name != null) {
      this.stallionOwnersForm.get('companyName')?.setValue(item.company_name);
    }
    if (item.company_structure != null) {
      this.stallionOwnersForm.get('companyStructure')?.setValue(item.company_structure);
    }
    if (item.capital != null) {
      this.stallionOwnersForm.get('capital')?.setValue(item.capital);
    }
    if (item.siren != null) {
      this.stallionOwnersForm.get('siren')?.setValue(item.siren);
    }
    if (item.rcs != null) {
      this.stallionOwnersForm.get('rcs')?.setValue(item.rcs);
    }
    if (item.head_office_address_line1 != null) {
      this.stallionOwnersForm.get('headOfficeAddressLine1')?.setValue(item.head_office_address_line1);
    }
    if (item.head_office_address_line2 != null) {
      this.stallionOwnersForm.get('headOfficeAddressLine2')?.setValue(item.head_office_address_line2);
    }
    if (item.head_office_address_city != null) {
      this.stallionOwnersForm.get('headOfficeAddressCity')?.setValue(item.head_office_address_city);
    }
    if (item.head_office_address_postal_code != null) {
      this.stallionOwnersForm.get('headOfficeAddressPostalCode')?.setValue(item.head_office_address_postal_code);
    }
    if (item.role_in_company != null) {
      this.stallionOwnersForm.get('roleInCompany')?.setValue(item.role_in_company);
    }
    if (item.birthdate != null) {
      this.stallionOwnersForm.get('birthdate')?.setValue(item.birthdate);
    }
    if (item.birthplace != null) {
      this.stallionOwnersForm.get('birthplace')?.setValue(item.birthplace);
    }
    if (item.citizenship != null) {
      this.stallionOwnersForm.get('citizenship')?.setValue(item.citizenship);
    }
    if (item.address_line1 != null) {
      this.stallionOwnersForm.get('addressLine1')?.setValue(item.address_line1);
    }
    if (item.address_line2 != null) {
      this.stallionOwnersForm.get('addressLine2')?.setValue(item.address_line2);
    }
    if (item.address_city != null) {
      this.stallionOwnersForm.get('addressCity')?.setValue(item.address_city);
    }
    if (item.address_postal_code != null) {
      this.stallionOwnersForm.get('addressPostalCode')?.setValue(item.address_postal_code);
    }
  }

  askForStallionOwnersFormEdit() {
    this.stallionOwnersFormLastSavedValue = this.stallionOwnersForm.getRawValue();
    this.savedStallionOwnerBusinessType = this.stallionOwnersForm.get("companyOrIndividualRadio")?.getRawValue();
    this.stallionOwnersFormIsBeingModified = true;
    this.stallionOwnersForm.get("companyOrIndividualRadio")?.enable();
    this.stallionOwnersForm.get("gender")?.enable();
  }

  cancelStallionOwnersFormEdition() {
    this.stallionOwnersForm.patchValue(this.stallionOwnersFormLastSavedValue);
    this.stallionOwnersFormIsBeingModified = false;
    this.stallionOwnersForm.get("companyOrIndividualRadio")?.setValue(this.savedStallionOwnerBusinessType);
    this.stallionOwnersForm.get("companyOrIndividualRadio")?.disable();
    this.stallionOwnersForm.get("gender")?.disable();
  }

  checkUserErrorInStallionOwnersForm() {
    if (!this.stallionOwnersForm.valid) {
      this.stallionOwnersFormPostPutStatus['status'] = backendInteractionStatus.UserError;
      this.stallionOwnersFormHelper.setValue("Tous les champs du formulaire suivis d'un astérisque (*) doivent être remplis.");
      throw new Error();
    }

    const stallionOwnersFormValue = this.stallionOwnersForm.getRawValue();
    if (this.selectedStallionOwnerBusinessType == "company") {
      if (
        stallionOwnersFormValue["gender"] == "Titre de civilité"
        || stallionOwnersFormValue["companyName"] == ""
        || stallionOwnersFormValue["companyStructure"] == ""
        || stallionOwnersFormValue["capital"] == ""
        || stallionOwnersFormValue["siren"] == ""
        || stallionOwnersFormValue["headOfficeAddressLine1"] == ""
        || stallionOwnersFormValue["headOfficeAddressCity"] == ""
        || stallionOwnersFormValue["headOfficeAddressPostalCode"] == ""
        || stallionOwnersFormValue["roleInCompany"] == ""
      ) {
        this.stallionOwnersFormPostPutStatus['status'] = backendInteractionStatus.UserError;
        this.stallionOwnersFormHelper.setValue("Tous les champs du formulaire suivis d'un astérisque (*) doivent être remplis.");
        throw new Error();
      }
    } else if (this.selectedStallionOwnerBusinessType == "individual") {
      if (
        stallionOwnersFormValue["gender"] == "Titre de civilité"
        || stallionOwnersFormValue["birthdate"] == ""
        || stallionOwnersFormValue["birthplace"] == ""
        || stallionOwnersFormValue["citizenship"] == ""
        || stallionOwnersFormValue["addressLine1"] == ""
        || stallionOwnersFormValue["addressCity"] == ""
        || stallionOwnersFormValue["addressPostalCode"] == ""
      ) {
        this.stallionOwnersFormPostPutStatus['status'] = backendInteractionStatus.UserError;
        this.stallionOwnersFormHelper.setValue("Tous les champs du formulaire suivis d'un astérisque (*) doivent être remplis.");
        throw new Error();
      }
    }

    return [this.selectedStallionOwnerBusinessType, stallionOwnersFormValue];
  }

  handleStallionOwnersValidation() {
    const stallionOwnerValue = this.stallionForm.get('stallionOwner')?.getRawValue();
    if ("Sélectionner" != stallionOwnerValue) {
      let businessType: string;
      let stallionOwnersFormValue: any;
      try {
        [businessType, stallionOwnersFormValue] = this.checkUserErrorInStallionOwnersForm()
      } catch {
        return
      }

      this.stallionOwnersFormPostPutStatus['status'] = backendInteractionStatus.Loading;
      if (this.aStallionOwnerIsBeingCreated) {
        this.stallionService.postStallionOwner(businessType, stallionOwnersFormValue, this.stallionOwnersFormPostPutStatus, this.stallionOwnersFormHelper)
        .subscribe({
          next: (response: PostStallionOwnerResponse) => {
            this.availableStallionOwnerIds.push(response.id);
            this.stallionForm.get('stallionOwner')?.setValue(this.availableStallionOwnerIds[this.availableStallionOwnerIds.length-1]);
            const nameInSelect: string = stallionOwnersFormValue['firstname'] + ' ' + stallionOwnersFormValue['lastname'];
            this.stallionOwnerIdToName[response.id] = nameInSelect;
            const stallionOwnerItem: StallionOwnerItem = this.createStallionOwnerItemFromForm(
              response.id,
              stallionOwnersFormValue,
              businessType
            );
            this.availableStallionOwners[response.id] = stallionOwnerItem;
            this.stallionOwnersForm.get("companyOrIndividualRadio")?.disable();
            this.stallionOwnersForm.get("gender")?.disable();
            this.aStallionOwnerIsBeingCreated = false;
            this.stallionOwnersFormPostPutStatus['status'] = backendInteractionStatus.Success;
            this.stallionOwnersFormHelper.setValue('Propriétaire ajouté avec succès.');
          }
        })
      } else {
        this.stallionService.putStallionOwner(
          businessType,
          stallionOwnersFormValue,
          stallionOwnerValue,
          this.stallionOwnersFormPostPutStatus,
          this.stallionOwnersFormHelper
        )
        .subscribe({
          next: () => {
            const nameInSelect: string = stallionOwnersFormValue['firstname'] + ' ' + stallionOwnersFormValue['lastname'];
            this.stallionOwnerIdToName[stallionOwnerValue] = nameInSelect;
            const stallionOwnerItem: StallionOwnerItem = this.createStallionOwnerItemFromForm(
              stallionOwnerValue,
              stallionOwnersFormValue,
              this.selectedStallionOwnerBusinessType
            );
            this.availableStallionOwners[stallionOwnerValue] = stallionOwnerItem;
            this.stallionOwnersFormIsBeingModified = false;
            this.stallionOwnersFormPostPutStatus['status'] = backendInteractionStatus.Success;
            this.stallionOwnersFormHelper.setValue('Propriétaire modifié avec succès.');
          },
          error: () => {

          }
        })
      }
    } 
  }

  triggerStallionOwnerDeletionModal() {
    this.deleteStallionOwnerModalIsActive = true;
  }

  closeStallionOwnerDeletionModal() {
    this.deleteStallionOwnerModalIsActive = false;
  }

  confirmStallionOwnerDeletion() {
    this.closeStallionOwnerDeletionModal();
    const selectedStallionOwnerId = this.stallionForm.get('stallionOwner')?.getRawValue();
    if (['Ajouter un propriétaire', 'Sélectionner', 'Moi'].includes(selectedStallionOwnerId)) {
      return
    }
    this.stallionOwnersFormDeleteStatus['status'] = backendInteractionStatus.Loading;
    this.stallionService.deleteStallionOwner(
      selectedStallionOwnerId,
      this.stallionComponentInput.stallionId,
      this.stallionOwnersFormPostPutStatus,
      this.stallionOwnersFormHelper
    ).subscribe({
      next: () => {
        const index = this.availableStallionOwnerIds.indexOf(selectedStallionOwnerId);
        if (index > -1) {
          this.availableStallionOwnerIds.splice(index, 1);
        }
        delete this.availableStallionOwners[selectedStallionOwnerId];
        delete this.stallionOwnerIdToName[selectedStallionOwnerId];
        if (this.availableStallionOwnerIds.length > 0) {
          this.stallionForm.get('stallionOwner')?.setValue(this.availableStallionOwnerIds[this.availableStallionOwnerIds.length-1]);
        } else {
          this.stallionForm.get('stallionOwner')?.setValue("Sélectionner");
          this.stallionOwnersForm.get('companyOrIndividualRadio')?.enable();
          this.stallionOwnersForm.get('gender')?.enable();
        }
        this.stallionOwnersFormDeleteStatus['status'] = backendInteractionStatus.Success;
      },
      error: () => {
        this.stallionOwnersFormDeleteStatus['status'] = backendInteractionStatus.BackendError;
      }
    })
  }

  // checkboxes
  updateCheckbox(checkboxType: 'productionBreeds' | 'coverTypes' | 'stallionStdNegativeTests' | 'stallionVaccines', event: any) {
    this[checkboxType][event.target.id] = event.target.checked;

    if (checkboxType === 'stallionStdNegativeTests') {
      let formControl = this.stallionForm.get(event.target.id + 'StallionTestDate')
      event.target.checked? formControl?.enable(): formControl?.disable();
    }

  }

  getSelectedCheckboxes(checkboxType: 'coverTypes' | 'productionBreeds' | 'stallionStdNegativeTests' | 'stallionVaccines') {
    let list = [];
    for (let key of Object.keys(this[checkboxType])) {
      if (this[checkboxType][key]) {
        list.push(key);
      }
    }
    return list;
  }

  updateNestedCheckbox(coverType: string, formControlName: string, checkboxType: 'mareSTDs' | 'mareVaccines', event: any) {
    this[checkboxType][coverType][event.target.id] = event.target.checked;
    if (['mareSTDs'].includes(checkboxType)) {
      let formControl = this.stallionForm.get(formControlName)
      event.target.checked? formControl?.enable(): formControl?.disable();
    }
  }

  isChecked(checkboxType: 'productionBreeds' | 'coverTypes' | 'stallionStdNegativeTests' | 'stallionVaccines', id: any) {
    return this[checkboxType][id];
  }

  isCheckedNested(coverType: string, checkboxType: 'mareSTDs' | 'mareVaccines', id: any) {
    return this[checkboxType][coverType][id];
  }

  // files
  fetchVerificationFile(event: any) {
    const file: File = event.target.files[0];
    if (!file) {
      return
    }

    if (file.size > verificationFileMaxSizeInBytes) {
      this.verificationFileHelper.setValue('La taille du fichier doit être inférieure à 10 Mo. Celle du fichier sélectionné les dépasse.');
      return
    }

    this.verificationFile = event.target.files[0];
    this.verificationFileHelper.setValue('');
  }

  fetchPhotos(event: any) {
    const file: File = event.target.files[0];
    if (!file) {
      return
    }

    if (file.size > photosMaxSizeInBytes) {
      this.photosHelper.setValue('La taille de chaque photo doit être inférieure à 4Mo.');
      return
    }

    this.photos.push(file);

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      this.photosURLs.push(this.sanitizer.bypassSecurityTrustUrl(img.src));
      this.photosHelper.setValue('');
      setTimeout(() => {
        URL.revokeObjectURL(img.src);
      }, 1000)
    };
  }

  deletePhoto(index: number) {
    this.photos.splice(index, 1);
    this.photosURLs.splice(index, 1);
    if (this.stallionComponentInput.mode == 'edition') {
      this.keptPhotos.splice(index, 1);
    }
  }

  // Stud-books
  swapStallionHasUnregisteredBreed() {
    if (!this.stallionHasUnregisteredBreed) {
      this.stallionForm.get('breed')?.setValue('');
    }
    this.stallionHasUnregisteredBreed = !this.stallionHasUnregisteredBreed;
  }

  triggerOtherProductionBreeds() {
    this.stallionHasUnregisteredProductionBreeds = true;
  }

  addAnotherProductionBreed() {
    let value: string = this.stallionForm.get('newProductionBreed')?.value;
    if (!this.productionBreedsAddedByHand.includes(value)) {
      this.productionBreedsAddedByHand.push(value);
    }
  }

  deleteAddedByHandProductionBreed(index: number) {
    this.productionBreedsAddedByHand.splice(index, 1);
  }

  // geoloc
  onGeolocationInput() {
    clearTimeout(this.geolocationInputTimer);
    this.locationIsValidated = false;
    this.geolocationInputTimer = setTimeout(() => {
      this.findCity()
    }, 750)
  }

  onGeolocationFocus() {
    this.displayGeolocDd = true;
  }

  onGeolocationBlur() {
    clearTimeout(this.geolocationInputTimer);
    setTimeout(() => {
      this.displayGeolocDd = false;
    }, 200)
  }

  findCity() {
    const inputLocationValue = this.stallionForm.getRawValue().location;
    if (inputLocationValue == "") {
      return
    }
    this.geolocStatus["status"] = backendInteractionStatus.Loading;
    this.locations.splice(0, this.locations.length);
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.geolocationService.getCity(
      inputLocationValue,
      this.geolocStatus,
      this.locationHelper)
      .subscribe({
        next: (data: getCityData) => {
          for (let item of data.content) {
            this.locations.push(item);
            this.locationTagValues.push(item.city + " (" + item.postal_code + ")")
          }
          this.locationHelper.setValue("");
          this.geolocStatus["status"] = backendInteractionStatus.Success;
        },
        error: () => {}
      })
  }

  resetCity() {
    this.locations.splice(0, this.locations.length);
    this.locationIsValidated = false;
    const locationControl = this.stallionForm.get('location');
    if (locationControl) {
      locationControl.setValue("");
    }
  }

  confirmLocationValue(index: number) {
    this.displayGeolocDd = false;
    const locationControl = this.stallionForm.get('location');
    if (locationControl) {
      locationControl.setValue(this.locations[index].city);
    }
    this.locationHelper.setValue("");
    this.selectedLocation = this.locations[index];
    this.locationTagValues.splice(0, this.locationTagValues.length);
    this.locationIsValidated = true;
  }

  // numbers
  makeNumberInteger(formControlName: string) {
    this.stallionForm.get(formControlName)?.setValue(
      this.stallionForm.getRawValue()[formControlName]
      .replace(/\D/g, '')
    )
  }

  // checking form validity
  getValueInStallionForm(field: string) {
    return this.stallionForm.getRawValue()[field];
  }

  formControlValueIsBetween15and50(field: string) {
    const value = this.stallionForm.getRawValue()[field];
    return 15 <= value && value <= 50;
  }

  birthdateFormatIsCorrect() {
    return /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(this.getValueInStallionForm("birthdate"));
  }

  dropdownIsSelected(field: 'breed' | 'stallionOwner') {
    if (field === 'breed') {
      return this.stallionForm.get('breed')?.value && (this.stallionForm.get('breed')?.value != "Sélectionner");
    } else {
      return this.stallionForm.get('stallionOwner')?.value && (this.stallionForm.get('stallionOwner')?.value != "Sélectionner");
    }
  }

  onSubmit() {
    if (this.stallionComponentInput.mode === "creation") {
      this.registerNewStallion();
    } else {
      this.editStallion();
    }
  }

  registerNewStallion() {
    // data validation
    let shouldThrowError = false;

    if (this.photos.length === 0) {
      this.photosHelper.setValue("Il faut au minimum une photo.");
      shouldThrowError = true;
    }

    if (!this.verificationFile) {
      this.verificationFileHelper.setValue("Une photo de test négatif est obligatoire.");
      shouldThrowError = true;
    }

    if (!this.birthdateFormatIsCorrect()) {
      shouldThrowError = true;
      if (this.getValueInStallionForm('birthdate')) {
        this.birthdateHelper.setValue("La date de naissance doit être au format JJ/MM/AAAA.");
      }
    }

    if (this.getSelectedCheckboxes('productionBreeds').length <= 0) {
      shouldThrowError = true;
    }

    if (this.getSelectedCheckboxes('coverTypes').length <= 0) {
      shouldThrowError = true;
    }

    if (!this.stallionForm.valid) {
      shouldThrowError = true;
    }

    if ("Sélectionner" == this.stallionForm.get('stallionOwner')?.getRawValue()) {
      shouldThrowError = true;
    }

    for (let coverType of this.getSelectedCheckboxes('coverTypes')) {
      if (
        !this.getValueInStallionForm(coverType + "Price")
        || !this.getValueInStallionForm(coverType + "BalancePaymentCondition")
        || !this.getValueInStallionForm(coverType + "AdvancePercentage")
        || !this.getValueInStallionForm(coverType + "CoverPlace")
        || !this.getValueInStallionForm(coverType + "MaximumNumberOfAttempts")
      ) {
        shouldThrowError = true;
      }

      if (!this.formControlValueIsBetween15and50(coverType + "AdvancePercentage")) {
        shouldThrowError = true;
      }

      for (let [std, value] of Object.entries(this.mareSTDs[coverType])) {
        if (value) {
          if (!this.getValueInStallionForm(coverType + std + 'MareTestOldness')) {
            shouldThrowError = true;
          }
        }
      }
    }

    // if data is not validated
    if (shouldThrowError) {
      this.stallionFormStatus['status'] = backendInteractionStatus.UserError;
      this.submitHelper.setValue("Certains champs du formulaire sont manquants ou contiennent des erreurs. Veuillez s'il vous plaît remonter la page, et les corriger.");
      throw new Error("Incomplete form");
    }

    // API calls
    this.stallionFormStatus['status'] = backendInteractionStatus.Loading;
    this.submitHelper.setValue('');
    return this.stallionService.registerNewStallion(
      this.stallionForm.getRawValue(),
      this.selectedLocation,
      this.getSelectedCheckboxes('coverTypes'),
      this.getSelectedCheckboxes('productionBreeds').concat(this.productionBreedsAddedByHand),
      this.getSelectedCheckboxes('stallionStdNegativeTests'),
      this.getSelectedCheckboxes('stallionVaccines'),
      this.mareSTDs,
      this.mareVaccines,
      this.stallionFormStatus,
      this.submitHelper,
      ).subscribe({
        next: (response: PostStallionResponse) => {
          return this.stallionService.uploadFiles(
            this.verificationFile,
            this.photos,
            response['stallion_id'],
            this.stallionFormStatus,
            this.submitHelper
          ).subscribe({
            next: () => {
              this.stallionFormStatus['status'] = backendInteractionStatus.Success;
              this.submitHelper.setValue('Étalon ajouté avec succès.');
            },
            error: () => {}
          })
        },
        error: () => {}
      });
  }

  editStallion() {
    // data validation
    let shouldThrowError = false;

    let nonNullPhotos = 0
    this.photos.forEach((photo: File | null) => {
      if (photo) {
        nonNullPhotos++;
      }
    })

    if (nonNullPhotos + this.keptPhotos.length === 0) {
      this.photosHelper.setValue("Il faut au minimum une photo.");
      shouldThrowError = true;
    }

    if (this.getSelectedCheckboxes('productionBreeds').length <= 0) {
      shouldThrowError = true;
    }

    if (this.getSelectedCheckboxes('coverTypes').length <= 0) {
      shouldThrowError = true;
    }

    if (!this.stallionForm.valid) {
      shouldThrowError = true;
    }

    for (let coverType of this.getSelectedCheckboxes('coverTypes')) {
      if (
        !this.getValueInStallionForm(coverType + "Price")
        || !this.getValueInStallionForm(coverType + "BalancePaymentCondition")
        || !this.getValueInStallionForm(coverType + "AdvancePercentage")
        || !this.getValueInStallionForm(coverType + "CoverPlace")
        || !this.getValueInStallionForm(coverType + "MaximumNumberOfAttempts")
      ) {
        shouldThrowError = true;
      }

      if (!this.formControlValueIsBetween15and50(coverType + "AdvancePercentage")) {
        shouldThrowError = true;
      }

      for (let [std, value] of Object.entries(this.mareSTDs[coverType])) {
        if (value) {
          if (!this.getValueInStallionForm(coverType + std + 'MareTestOldness')) {
            shouldThrowError = true;
          }
        }
      }
    }

    // if data is not validated
    if (shouldThrowError) {
      this.stallionFormStatus['status'] = backendInteractionStatus.UserError;
      this.submitHelper.setValue("Certains champs du formulaire sont manquants ou contiennent des erreurs. Veuillez s'il vous plaît remonter la page, et les corriger.");
      throw new Error("Incomplete form");
    }

    if (this.stallionComponentInput.stallionId === null) {
      this.submitHelper.setValue('Une erreur est survenue. Merci de réessayer.');
      throw new Error();
    }

    const stallionId = this.stallionComponentInput.stallionId;

    this.stallionFormStatus['status'] = backendInteractionStatus.Loading;
    return this.stallionService.editStallion(
      stallionId,
      this.stallionForm.getRawValue(),
      this.selectedLocation,
      this.getSelectedCheckboxes('coverTypes'),
      this.getSelectedCheckboxes('productionBreeds').concat(this.productionBreedsAddedByHand),
      this.getSelectedCheckboxes('stallionStdNegativeTests'),
      this.getSelectedCheckboxes('stallionVaccines'),
      this.mareSTDs,
      this.mareVaccines,
      this.stallionFormStatus,
      this.submitHelper,
    )
    .subscribe({
      next: () => {
        return this.stallionService.uploadNewPhotos(
          this.keptPhotos,
          this.photos,
          stallionId,
          this.stallionFormStatus,
          this.submitHelper
        )
        .subscribe({
          next: () => {
            this.stallionFormStatus['status'] = backendInteractionStatus.Success;
            this.submitHelper.setValue('Informations mises à jour avec succès.');
            this.saveButtonIsDisabled = true;
            setTimeout(() => {
              this.getBackToMyStallions();
            }, 2000)
          },
          error: () => {}
        })
      },
      error: () => {}
    })
  }

  getBackToMyStallions() {
    this.router.navigate(['/dashboard'], {queryParams: { myStallions: 'true' }});
  }
}
