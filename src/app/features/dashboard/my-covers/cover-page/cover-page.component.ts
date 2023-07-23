import { Component, Input, OnInit } from '@angular/core';
import { CoverPageService, GetCoverInfo } from './cover-page.service';
import { availableCoverTypes, statusMapping } from 'src/environments/environment';
import { Form, FormControl } from '@angular/forms';

@Component({
  selector: 'app-cover-page',
  templateUrl: './cover-page.component.html',
  styleUrls: ['./cover-page.component.css'],
  providers: [CoverPageService]
})
export class CoverPageComponent implements OnInit{
  @Input() coverId: string = "";

  public availableCoverTypes = availableCoverTypes;
  public statusMappingObject = statusMapping;
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
  public price: number = 0;
  public messageFromBuyer: string = "";
  public timestamps: Record<string, string> = {};

  public lastSavedNotesValue: string = "";
  public notesFormControl: FormControl = new FormControl('');

  public updateNotesMessage: FormControl = new FormControl('');
  public updateNotesSuccess: Record<string, boolean> = {'status': false};
  public notesAreBeingModified: boolean = false;

  constructor(private coverPageService: CoverPageService) {}

  ngOnInit(): void {
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
      this.messageFromBuyer = data.buyer_message.replace(/(\r\n|\r|\n)/g, '<br>');
      this.timestamps = data.timestamps;
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
}
