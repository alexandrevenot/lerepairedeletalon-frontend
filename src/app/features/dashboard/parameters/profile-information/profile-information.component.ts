import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProfileInformation, ProfileInformationService, backToFrontNames } from './profile-information.service';

@Component({
  selector: 'app-profile-information',
  templateUrl: './profile-information.component.html',
  styleUrls: ['./profile-information.component.css'],
  providers: [ProfileInformationService]
})
export class ProfileInformationComponent implements OnInit{
  // init
  public theUserAlreadyHasProfileInformation: Record<string, boolean> = {"status": false};

  // backend communication
  public backToFrontNames = backToFrontNames;

  // form data
  public selectedProfileType: string = "";
  public profileInformationForm!: FormGroup;
  public selectedRepresentativeGender: string = "";
  public selectedGender: string = "";

  // 
  public lastSavedFormValue: string = "";
  public formFormControl: FormControl = new FormControl('');

  public updateFormMessage: FormControl = new FormControl('');
  public updateFormSuccess: Record<string, boolean> = {'status': false};
  public formIsBeingModified: boolean = false;

  // form data validation
  public formNotValid: boolean = false;
  public backendErrorStatus: Record<string, boolean> = {'status': false}
  public buttonIsLoading:  Record<string, boolean> = {'status': false}

  constructor(
    private profileInformationService: ProfileInformationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    let formGroupContent: Record<string, Array<any>> = {};
    let k: keyof typeof this.backToFrontNames;
    for (k in this.backToFrontNames) {
      formGroupContent[this.backToFrontNames[k]] = ['']
    }
    formGroupContent['companyOrIndividualRadio'] = ['', Validators.required];

    this.profileInformationForm = this.formBuilder.group(formGroupContent);

    this.profileInformationForm.get('companyOrIndividualRadio')?.valueChanges
    .subscribe(value => {
      this.selectedProfileType = value;
    });

    this.profileInformationForm.get('representativeGender')?.valueChanges
    .subscribe(value => {
      this.selectedRepresentativeGender = value;
    });

    this.profileInformationForm.get('gender')?.valueChanges
    .subscribe(value => {
      this.selectedGender = value;
    });

    this.profileInformationService.getProfileInformation(this.theUserAlreadyHasProfileInformation)
    .subscribe((data: ProfileInformation) => {
      let k: keyof typeof data;
      for (k in data) {
        this.profileInformationForm.get(this.backToFrontNames[k])?.setValue(data[k]);
      }
      this.profileInformationForm.get('companyOrIndividualRadio')?.setValue(data.type);

      this.theUserAlreadyHasProfileInformation['status'] = true;
    })
  }

  askForFormEdit() {
    this.formIsBeingModified = true;
  }

  cancelFormEdition() {
    this.formIsBeingModified = false;
    this.formFormControl.setValue(this.lastSavedFormValue);
  }

  saveProfileInformation() {
    if (!this.profileInformationForm.valid) {
      this.formNotValid = true;
      this.backendErrorStatus['status'] = true;
      this.updateFormMessage.setValue("Remplissez s'il vous plaît tous les champs du formulaire de demande.");
      return
    } else {
      this.formNotValid = false;
    }

    this.buttonIsLoading['status'] = true;
    this.profileInformationService.updateProfileInformation(
      this.selectedProfileType,
      this.profileInformationForm.getRawValue(),
      this.backendErrorStatus,
      this.updateFormMessage,
      this.buttonIsLoading
    ).subscribe(() => {
      this.lastSavedFormValue = this.formFormControl.value;
      this.updateFormMessage.setValue("Les informations ont bien été sauvegardées.")
      this.backendErrorStatus['status'] = false;
      this.buttonIsLoading['status'] = false;
      this.formIsBeingModified = false;
    })
  }
}
