import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerCoverBoxComponent } from './seller-cover-box.component';

describe('SellerCoverBoxComponent', () => {
  let component: SellerCoverBoxComponent;
  let fixture: ComponentFixture<SellerCoverBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SellerCoverBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerCoverBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
