import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyStallionsComponent } from './my-stallions.component';

describe('MyStallionsComponent', () => {
  let component: MyStallionsComponent;
  let fixture: ComponentFixture<MyStallionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyStallionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyStallionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
