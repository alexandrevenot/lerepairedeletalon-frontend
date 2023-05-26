import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterNewStallionComponent } from './register-new-stallion.component';

describe('RegisterNewStallionComponent', () => {
  let component: RegisterNewStallionComponent;
  let fixture: ComponentFixture<RegisterNewStallionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterNewStallionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterNewStallionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
