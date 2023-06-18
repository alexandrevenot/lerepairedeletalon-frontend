import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallionPanelItemComponent } from './stallion-panel-item.component';

describe('StallionPanelItemComponent', () => {
  let component: StallionPanelItemComponent;
  let fixture: ComponentFixture<StallionPanelItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StallionPanelItemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallionPanelItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
