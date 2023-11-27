import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteStallionBoxComponent } from './favorite-stallion-box.component';

describe('FavoriteStallionBoxComponent', () => {
  let component: FavoriteStallionBoxComponent;
  let fixture: ComponentFixture<FavoriteStallionBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FavoriteStallionBoxComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FavoriteStallionBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
