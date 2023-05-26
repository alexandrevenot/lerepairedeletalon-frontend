import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.component';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from 'src/app/layout/navbar/navbar.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let p: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        RegisterComponent,
        NavbarComponent
       ],
       imports: [
        HttpClientTestingModule,
        ReactiveFormsModule
       ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    p = fixture.nativeElement.querySelector('p');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
