import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from 'src/app/layout/navbar/navbar.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpTestingController: HttpTestingController;
  let p: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        LoginComponent,
        NavbarComponent  
      ],
       imports: [
        HttpClientTestingModule,
        ReactiveFormsModule
       ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    p = fixture.nativeElement.querySelector('p');

    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add the access and refresh tokens to the localStorage', () => {
    fixture.detectChanges();
    expect(p.textContent).toEqual("");
    component.onSubmit();
    
    const testData = {
      accessToken: "at",
      refreshToken: "rt"
    }

    const req = httpTestingController.expectOne('http://localhost:3001/auth/login');

    expect(req.request.method).toEqual('POST');

    req.flush(testData);

    expect(localStorage.getItem("accessToken")).toEqual("at");
    expect(localStorage.getItem("refreshToken")).toEqual("rt");
    fixture.detectChanges();
    expect(p.textContent).toEqual("Connexion réussie.");

    httpTestingController.verify();
  });

});
