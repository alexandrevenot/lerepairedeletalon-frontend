import { Component, EventEmitter, Output, OnInit  } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterNewStallionService } from './register-new-stallion.service';
import { availableBreeds, availableColors, getNumberArray, photosMaxSizeInBytes } from 'src/environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-register-new-stallion',
  templateUrl: './register-new-stallion.component.html',
  styleUrls: ['./register-new-stallion.component.css'],
  providers: [RegisterNewStallionService]
})
export class RegisterNewStallionComponent implements OnInit {

  @Output() returnToStallionListEE = new EventEmitter();

  public availableBreeds = availableBreeds;
  public availableColors = availableColors;
  public photosMaxSizeInBytes = photosMaxSizeInBytes;
  public getNumberArray = getNumberArray;

  public submitted!: {[key: string]: boolean};
  public registerNewStallionForm!: FormGroup;
  public breed!: string;
  public color!: string;
  public cSaillies!: File;
  public photos: File[] = [];
  public rTypes!: { [key: string]: boolean };

  public photosURLs: SafeUrl[] = [];
  public registerMessage!: FormControl;
  public photosMessage!: FormControl;

  constructor(
    private registerNewStallionService: RegisterNewStallionService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer
    ) {}
  
  ngOnInit(): void {
    this.submitted = {status: false};
    this.registerMessage = new FormControl('');
    this.photosMessage = new FormControl('');
  
    this.registerNewStallionForm = this.formBuilder.group({
      name: ['', Validators.required],
      nSIRE: ['', Validators.required],
      mainDesc: [''],
      birthdate: ['', Validators.required],
      height: ['', Validators.required],
      offspring: [''],
      performance: [''],
      p1: [''],
      p2: [''],
      p3: [''],
      p4: [''],
      p5: [''],
      p6: [''],
      p7: [''],
      p8: [''],
      p9: [''],
      p10: [''],
      p11: [''],
      p12: [''],
      p13: [''],
      p14: [''],
      pedigreePO: [''],
      comments: [''],
      price: ['', Validators.required],
      location: ['', Validators.required]
    })
  
    this.breed = "Sélectionner";
    this.rTypes = {
      lib: false,
      iai: false,
      iarp: false,
      iac: false,
      iate: false,
      icsi: false
    }
  }

  returnToStallionList() {
    this.returnToStallionListEE.emit();
  }

  updateSelect(type: 'color' | 'breed', event: any) {
    this[type] = event.target.value;
  }

  fetchCSaillies(event: any) {
    this.cSaillies = event.target.files[0];
    console.log(event.target.files[0])
  }

  fetchPhotos(event: any) {
    const selectedFile: File = event.target.files[0];
    if (selectedFile && selectedFile.size > photosMaxSizeInBytes) {
      this.photosMessage.setValue('La taille de chaque photo doit être inférieure à 4Mo.');
    } else {
      this.photos.push(selectedFile);
  
      const img = new Image();
      img.src = URL.createObjectURL(selectedFile);
  
      img.onload = () => {
        const width: number = img.width;
        const height: number = img.height;
    
        URL.revokeObjectURL(img.src);
        
        this.photosURLs.push(this.sanitizer.bypassSecurityTrustUrl(img.src));
        let value = this.photosMessage.value;
        if (value != "") {
          this.photosMessage.setValue('');
        }
      };
    }
  }

  deletePhoto(index: number) {
    this.photos.splice(index, 1);
    this.photosURLs.splice(index, 1);
  }

  updateRType(event: any) {
    this.rTypes[event.target.id] = event.target.checked;
  }

  onSubmit() {
    this.submitted['status'] = true;
    this.registerNewStallionService.postRegisterNewStallion(
      this.registerNewStallionForm.getRawValue(),
      this.breed,
      this.color,
      this.cSaillies,
      this.photos,
      this.rTypes,
      this.submitted,
      this.registerMessage
      ).subscribe(() => {
        this.submitted['status'] = false;
        this.registerMessage.setValue('Étalon ajouté avec succès.');
      })
  }

}
