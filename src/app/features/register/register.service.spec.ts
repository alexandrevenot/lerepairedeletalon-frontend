import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { RegisterService } from './register.service';
import { HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import { FormControl } from '@angular/forms';

describe('RegisterService', () => {
    let service: RegisterService;
    let httpTestingController: HttpTestingController;
    let message: FormControl;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [RegisterService],
            imports: [ HttpClientTestingModule ]
        });
      
        httpTestingController = TestBed.inject(HttpTestingController);
        service = TestBed.inject(RegisterService);
        message = new FormControl('');
    });

    describe('handleError', () => {
        it('should handle correctly status 0', () => {
            let error = new HttpErrorResponse({status:0});
            service.handleError(error, message);
            expect(message.value).toEqual('Une erreur est survenue. Merci de réessayer.');
        });
        it('should handle correctly status 400', () => {
            let error = new HttpErrorResponse({status:400});
            service.handleError(error, message);
            expect(message.value).toEqual('Un compte existe déjà avec cette adresse mail.');
        });
        it('should handle correctly other status', () => {
            let error = new HttpErrorResponse({status:451});
            service.handleError(error, message);
            expect(message.value).toEqual('Une erreur est survenue. Merci de réessayer.');
        });
    });

    describe('postRegister', () => {
        it('can test HttpClient.get', () => {            
            service.postRegister("whatever", "whateveralso", message, {status: false})
            .subscribe();
          
            const req = httpTestingController.expectOne('http://localhost:3001/auth/register');
          
            expect(req.request.method).toEqual('POST');
          
            httpTestingController.verify();
          });
    });
});
