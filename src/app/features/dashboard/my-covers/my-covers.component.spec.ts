import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerMyCoversComponent } from './seller-my-covers.component';

describe('SellerMyCoversComponent', () => {
  let component: SellerMyCoversComponent;
  let fixture: ComponentFixture<SellerMyCoversComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SellerMyCoversComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerMyCoversComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
