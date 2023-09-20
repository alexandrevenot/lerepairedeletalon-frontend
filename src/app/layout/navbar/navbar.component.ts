import { Component, OnInit } from '@angular/core';
import { NavbarService, connectionStatus } from './navbar.service';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers: [
    AuthService
  ]
})
export class NavbarComponent implements OnInit {

  public firstname: string = "";
  public lastname: string = "";
  public userIsLoggedIn: boolean = false;

  constructor (
    private navbarService: NavbarService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.navbarService.loadNavbarEvent
    .subscribe((data: connectionStatus) => {
      this.firstname = data.firstname;
      this.lastname = data.lastname;
      this.userIsLoggedIn = data.userIsLoggedIn;
    })

    this.navbarService.loadNavbar();
  }

  disconnectUser() {
    this.authService.disconnectUser();
  }
}