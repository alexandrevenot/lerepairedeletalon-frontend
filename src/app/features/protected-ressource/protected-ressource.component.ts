import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-protected-ressource',
  templateUrl: './protected-ressource.component.html',
  styleUrls: ['./protected-ressource.component.css']
})
export class ProtectedRessourceComponent {
  constructor(private http: HttpClient) { }

  status = "nope";
  buttonIsClicked = {status: false};

  access() {
    this.buttonIsClicked.status = true;
    this.http.get("http://localhost:3001/auth/protected-route").pipe(catchError((err: HttpErrorResponse) => {
      this.buttonIsClicked.status = false;
      this.status = "nope"; 
      return throwError(() => err);
  })).subscribe((data) => {
      console.log(data);
      this.buttonIsClicked.status = false;
      this.status = "bogosse";
    })
  }

}
