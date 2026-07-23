import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { LoginService } from 'src/app/services/login/login.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Properties
  firstName: string;
  lastName: string;
  profileImage: string;
  subscription = new Subscription();

  get authenticated(): boolean {
    const token = this.localStorageService.get('token', false);
    if (token) {
      if (!this.firstName) {
        this.profileService.pushProfile();
      }
      return true;
    }
    return false;
  }

  constructor(
    private profileService: ProfileService,
    private localStorageService: LocalStorageService,
    private logoutService: LoginService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.firstName = '';
    this.lastName = '';
    this.profileImage = 'assets/img/people.png';
  }

  ngOnInit() {
    this.profileDetails();
  }

  profileDetails() {
    this.subscription.add(
      this.profileService.userProfile$.subscribe(res => {
        const profileData = res.data.profile;
        if (profileData.image) {
          this.profileImage = profileData.image;
        }
        this.firstName = profileData.user.first_name;
        this.lastName = profileData.user.last_name;
        this.cdr.detectChanges();
      })
    );
  }

  handleLogout() {
    this.subscription.add(
      this.logoutService.logoutUser().subscribe(
        _ => {
          this.clearStorage();
        },
        _ => {
          this.clearStorage();
        }
      ));
  }

  clearStorage() {
    this.localStorageService.clear();
    this.firstName = '';
    this.lastName = '';
    this.profileImage = 'assets/img/people.png';
    this.cdr.detectChanges();
    this.router.navigate(['/home']);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
