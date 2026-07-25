import { Component } from '@angular/core';
import { LoginService } from 'src/app/services/SocialAuth/socialauth.service';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
  SocialAuthService,
  SocialUser
} from '@abacritt/angularx-social-login';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

import { LocalStorageService } from 'src/app/services/local-storage.service';

@Component({
  standalone: false,
  selector: 'app-social-login',
  templateUrl: './socialauth.component.html',
  styleUrls: ['./socialauth.component.scss']
})
export class SocialLoginComponentt {
  user: SocialUser = null;
  loggedIn: boolean;
  loading: boolean = true;


  // inject services and depe
  constructor(
    private socialAuthService: SocialAuthService,
    private loginService: LoginService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private localStorageService: LocalStorageService
  ) { }
  signInWithGoogle() {
    this.spinner.show();
    this.socialAuthService
      .signIn(GoogleLoginProvider.PROVIDER_ID)
      .then(userData => {
        this.loginService
          .createGoogleUser({
            google: { access_token: userData.idToken }
          })
          .subscribe(result => {
            this.spinner.hide();
            this.localStorageService.set('token', result.token);
            this.router.navigate(['/home']);
          });
      })
      .catch(error => {
        this.toastr.error(error);
        this.spinner.hide();
      });
  }

  signInWithFB() {
    this.spinner.show();
    this.socialAuthService
      .signIn(FacebookLoginProvider.PROVIDER_ID)
      .then(userData => {
        this.loginService
          .createFacebookUser({
            facebook: { access_token: userData.authToken }
          })
          .subscribe(result => {
            this.spinner.hide();
            this.localStorageService.set('token', result.token);
            this.router.navigate(['/home']);
          });
      })
      .catch(error => {
        this.spinner.hide();
        this.toastr.error(error);
      });
  }
}
