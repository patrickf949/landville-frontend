import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, Subscription } from 'rxjs';
import { LoginService } from 'src/app/services/login/login.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptor implements HttpInterceptor {
  subscription = new Subscription();
  constructor(private loginService: LoginService, private router: Router, private localStorageService: LocalStorageService) {

  }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(catchError(err => {
      if (err.status === 401) {
        // Clear local storage and navigate first so the UI responds immediately
        this.localStorageService.clear();
        this.router.navigate(['/login'], { queryParams: { next: this.router.url } });
        
        // Attempt to notify the backend, but only if this wasn't the logout request itself
        if (!req.url.includes('/auth/logout/')) {
          this.loginService.logoutUser().subscribe({
            next: () => {},
            error: () => {}
          });
        }
      }

      const error = err.error || err.statusText;
      return throwError(() => err);
    }));
  }

}
