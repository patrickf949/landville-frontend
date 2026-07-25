import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ErrorInterceptor } from './error.interceptor';
import { LoginService } from 'src/app/services/login/login.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

describe('ErrorInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let loginServiceSpy: jasmine.SpyObj<LoginService>;
  let localStorageSpy: jasmine.SpyObj<LocalStorageService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    loginServiceSpy = jasmine.createSpyObj('LoginService', ['logoutUser']);
    localStorageSpy = jasmine.createSpyObj('LocalStorageService', ['clear']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    (routerSpy as any).url = '/current-page';

    loginServiceSpy.logoutUser.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: LoginService, useValue: loginServiceSpy },
        { provide: LocalStorageService, useValue: localStorageSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: ErrorInterceptor,
          multi: true
        }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should handle 401 error, clear localStorage, and redirect to login', () => {
    httpClient.get('/test-url').subscribe({
      error: (err) => {
        expect(err.status).toBe(401);
      }
    });

    const req = httpMock.expectOne('/test-url');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorageSpy.clear).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { next: '/current-page' } });
    expect(loginServiceSpy.logoutUser).toHaveBeenCalled();
  });

  it('should pass through normal responses without error', () => {
    httpClient.get('/normal-url').subscribe(res => {
      expect(res).toEqual({ data: 'ok' });
    });

    const req = httpMock.expectOne('/normal-url');
    req.flush({ data: 'ok' });
  });
});
