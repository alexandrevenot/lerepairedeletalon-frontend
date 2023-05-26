import { ComponentFixture, TestBed } from '@angular/core/testing';

import MyStallionsListComponent from './my-stallions-list.component';

describe('MyStallionsListComponent', () => {
  let component: MyStallionsListComponent;
  let fixture: ComponentFixture<MyStallionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MyStallionsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyStallionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
