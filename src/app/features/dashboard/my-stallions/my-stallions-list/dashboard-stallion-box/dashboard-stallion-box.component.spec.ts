import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardStallionBoxComponent } from './dashboard-stallion-box.component';

describe('DashboardStallionBoxComponent', () => {
  let component: DashboardStallionBoxComponent;
  let fixture: ComponentFixture<DashboardStallionBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardStallionBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardStallionBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
