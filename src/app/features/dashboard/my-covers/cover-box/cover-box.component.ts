import { Component, Input } from '@angular/core';
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

  public statusMappingObject = statusMapping;
  public statusHelperObject = statusHelper;
}
