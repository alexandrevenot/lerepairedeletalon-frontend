import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallionProfileComponent } from './stallion-profile.component';

describe('StallionProfileComponent', () => {
  let component: StallionProfileComponent;
  let fixture: ComponentFixture<StallionProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StallionProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallionProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
