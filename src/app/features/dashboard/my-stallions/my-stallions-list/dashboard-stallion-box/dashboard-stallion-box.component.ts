import { Component, ElementRef, Input, EventEmitter, Output, HostListener, } from '@angular/core';
import { StallionBoxItem } from '../my-stallions-list.component'
import { profileStatuses } from 'src/environments/environment';
import { DashboardStallionBoxService } from './dashboard-stallion-box.service';

interface StallionActionMessage {
  stallionId: string | null;
  action: 'edit' | 'reload';
}

@Component({
  selector: 'app-dashboard-stallion-box',
  templateUrl: './dashboard-stallion-box.component.html',
  styleUrls: ['./dashboard-stallion-box.component.css'],
  providers: [DashboardStallionBoxService],
  host: {
    '(document:click)': 'onClick($event)',
  }
})
export class DashboardStallionBoxComponent{
  @Input() item: StallionBoxItem = {
    id: null,
    name: null,
    breed: null,
    profilePicture: null,
    lastUpdateTimestamp: null,
    profileStatus: 'visible'
  };
  @Output() stallionAction = new EventEmitter<StallionActionMessage>();

  public profileStatuses = profileStatuses;
  public optionsIsClicked: boolean = false;
  public stallionDeletionModalIsActive: boolean = false;

  constructor(
    private _eref: ElementRef,
    private dashboardStallionBoxService: DashboardStallionBoxService
    ) { }

  onClick(event: any) {
    if (!this._eref.nativeElement.querySelector('.options-button').contains(event.target)) {
      this.optionsIsClicked = false;
    }
   }

  swapDropdownActivation() {
    this.optionsIsClicked = !this.optionsIsClicked;
  }

  triggerStallionDeletionModal() {
    this.stallionDeletionModalIsActive = true;
  }

  closeStallionDeletionModal() {
    this.stallionDeletionModalIsActive = false;
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeStallionDeletionModal();
    }
  }

  deleteStallion() {
    if (this.item.id) {
      this.closeStallionDeletionModal();
      this.dashboardStallionBoxService.deleteStallion(this.item.id)
      .subscribe(() => {
        this.stallionAction.emit({
          stallionId: null,
          action: 'reload'
        });
      })
    }
  }

  editStallion() {
    if (this.item.id) {
      this.stallionAction.emit({
        stallionId: this.item.id,
        action: 'edit'
      });
    }
  }

  makeStallionHidden() {
    if (this.item.id) {
      this.dashboardStallionBoxService.changeStallionProfileStatus(
        this.item.id,
        'hidden'
      ).subscribe(() => {
        this.stallionAction.emit({
          stallionId: null,
          action: 'reload'
        });
      })
    }
  }

  makeStallionVisible() {
    if (this.item.id) {
      this.dashboardStallionBoxService.changeStallionProfileStatus(
        this.item.id,
        'visible'
      )
      .subscribe(() => {
        this.stallionAction.emit({
          stallionId: null,
          action: 'reload'
        });
      })
    }
  }
}