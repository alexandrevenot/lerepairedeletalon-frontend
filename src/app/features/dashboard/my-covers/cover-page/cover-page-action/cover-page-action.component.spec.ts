import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoverPageActionComponent } from './cover-page-action.component';

describe('CoverPageActionComponent', () => {
  let component: CoverPageActionComponent;
  let fixture: ComponentFixture<CoverPageActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoverPageActionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoverPageActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
