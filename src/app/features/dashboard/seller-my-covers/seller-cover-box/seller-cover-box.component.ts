import { Component, Input } from '@angular/core';
import { coverItem } from '../seller-my-covers.service';
import { statusHelper } from '../../../../../environments/environment';

@Component({
  selector: 'app-seller-cover-box',
  templateUrl: './seller-cover-box.component.html',
  styleUrls: ['./seller-cover-box.component.css']
})
export class SellerCoverBoxComponent {
  @Input() item: coverItem = {
    id: "",
    stallion_name: "",
    mare_name: "",
    status: ""
  };

  public statusHelperObject = statusHelper;
}
