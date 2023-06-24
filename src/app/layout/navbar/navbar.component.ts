import { Component, OnInit } from '@angular/core';
import { NavbarService, returnUser } from './navbar.service';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers: [
    NavbarService,
    AuthService
  ]
})
export class NavbarComponent implements OnInit {

  public firstname: string | null = null;
  public lastname: string | null = null;
  public userIsLoggedIn: boolean = false;

  constructor (
    private navbarService: NavbarService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.navbarService.getUser()
    .subscribe((data: returnUser) => {
      if (data.firstname && data.lastname) {
        this.firstname = data.firstname;
        this.lastname = data.lastname;
        this.userIsLoggedIn = true;
      } else {
        this.userIsLoggedIn = false;
      }
    })
  }

  disconnectUser() {
    this.authService.disconnectUser();
  }
}