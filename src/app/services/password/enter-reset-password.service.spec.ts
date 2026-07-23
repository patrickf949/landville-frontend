import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { EnterResetPasswordService } from './enter-reset-password.service';
import { APPCONFIG } from 'src/app/config';

describe('EnterResetPasswordService', () => {
  let httpMock: HttpTestingController;
  const url = `${APPCONFIG.base_url}/auth/password-reset/?token=token`;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [HttpClientTestingModule ],
  });
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create EnterResetPasswordService', () => {
    const service: EnterResetPasswordService = TestBed.inject(EnterResetPasswordService);
    expect(service).toBeTruthy();
  });

  it('should trigger a service valid password inputs', () => {
    const service: EnterResetPasswordService = TestBed.inject(EnterResetPasswordService);
    const mockData = {
      newPassword: 'akram100',
      confirmPassword: 'akram100'
    };
    service.changePassword('token', mockData).subscribe();
    const req = httpMock.expectOne(url);
    expect(req.request.url).toEqual(url);
    req.flush(mockData);
    });
});
