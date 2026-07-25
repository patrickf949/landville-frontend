import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { JwtHelperService } from '@auth0/angular-jwt';


@Injectable({
providedIn: 'root'
})
export class AuthService {
constructor(private localStorage: LocalStorageService, @Inject(PLATFORM_ID) private platformId: Object) { }

isLoggedIn(): boolean {
  if (!isPlatformBrowser(this.platformId)) {
    return true; // Assume logged in on server side to prevent premature redirects
  }
  const helper = new JwtHelperService();
  const token = this.localStorage.get('token', '');
  let decodedToken = null;
  try {
    decodedToken = helper.decodeToken(token);
  } catch (error) {
    return false;
  }
  return !!decodedToken && !helper.isTokenExpired(token);
}




}
