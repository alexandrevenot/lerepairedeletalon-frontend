import { Component, EventEmitter, Input, Output } from '@angular/core';
import { coverItem } from '../my-covers.service';
import { statusHelper, statusMapping } from '../../../../../environments/environment';

@Component({
  selector: 'app-cover-box',
  templateUrl: './cover-box.component.html',
  styleUrls: ['./cover-box.component.css']
})
export class CoverBoxComponent {
  @Input() item: coverItem = {
    id: "",
    stallion_name: "",
    mare_name: "",
    status: "",
    income: 0
  };
  @Output() goToCoverPageEvent = new EventEmitter();

  public statusMappingObject = statusMapping;
  public statusHelperObject = statusHelper;

  goToCoverPage(coverId: string) {
    this.goToCoverPageEvent.emit(coverId);
  }
}
