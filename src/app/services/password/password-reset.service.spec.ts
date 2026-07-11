import { TestBed } from '@angular/core/testing';
import {HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { PasswordResetService } from './password-reset.service';
import { APPCONFIG } from 'src/app/config';

describe('PasswordResetService', () => {
  let httpMock: HttpTestingController;
  const url = `${APPCONFIG.base_url}/auth/password-reset/`;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [HttpClientTestingModule ],
  });
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create PasswordResetService', () => {
    const service: PasswordResetService = TestBed.inject(PasswordResetService);
    expect(service).toBeTruthy();
  });

  it('should trigger a service with valid email address', () => {
    const service: PasswordResetService = TestBed.inject(PasswordResetService);
    const mockData = {
      email: 'joel@andela.com'
    };
    service.getResetLink(mockData).subscribe();
    const req = httpMock.expectOne(url);
    req.flush(mockData);
    });

  it('should throw an error when invalid email is provided', () => {
      const service: PasswordResetService = TestBed.inject(PasswordResetService);
      const mockData = {
        email: 'joelandela.com'
      };
      service.getResetLink(mockData).subscribe();
      const req = httpMock.expectOne(url);
      req.flush(mockData);
      });
});
