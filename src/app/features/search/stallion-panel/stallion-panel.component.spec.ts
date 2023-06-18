import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallionPanelComponent } from './stallion-panel.component';

describe('StallionPanelComponent', () => {
  let component: StallionPanelComponent;
  let fixture: ComponentFixture<StallionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StallionPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
