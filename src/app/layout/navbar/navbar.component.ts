import { Component, OnInit } from '@angular/core';
import { NavbarService, connectionStatus } from './navbar.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Router } from '@angular/router';
import { objectStorageBaseUrl, photosPrefix } from 'src/environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  providers: [
    
  ]
})
export class NavbarComponent implements OnInit {

  public objectStorageBaseUrl = objectStorageBaseUrl;
  public photosPrefix = photosPrefix;

  public firstname: string = "";
  public lastname: string = "";
  public userIsLoggedIn: boolean = false;

  public burgerMenuIsActive: boolean = false;

  constructor (
    private navbarService: NavbarService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.navbarService.loadNavbarEvent
    .subscribe({
      next: (data: connectionStatus) => {
        this.firstname = data.firstname;
        this.lastname = data.lastname;
        this.userIsLoggedIn = data.userIsLoggedIn;
      },
      error: () => {}
    })

    setTimeout(() => {
      this.navbarService.loadNavbar();
    }, 300)
  }

  disconnectUser() {
    this.authService.disconnectUser();
  }

  navigateTo(path: string, reload: boolean) {
    this.burgerMenuIsActive = false;
    if (reload) {
      this.router.navigate([`/${path}`], {queryParams: { reload: 'true' }}).then(() => {
        window.scrollTo(0, 0);
      });
    } else {
      this.router.navigate([`/${path}`], ).then(() => {
        window.scrollTo(0, 0);
      });
    }
  }

  swapBurgerMenuActivation() {
    this.burgerMenuIsActive = !this.burgerMenuIsActive;
  }
}