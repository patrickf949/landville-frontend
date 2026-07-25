import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  HttpClientTestingModule
} from '@angular/common/http/testing';

import { ProfileService } from './profile.service';
import {
  mockProfileResponse,
  mockUpdatedProfileResponse
} from '../../helpers/tests/mocks';
import { LocalStorageService } from '../local-storage.service';
import { APPCONFIG } from 'src/app/config';

describe('ProfileService', () => {
  let httpMock: HttpTestingController;
  let service: ProfileService;
  let storage: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProfileService, LocalStorageService]
    });
    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getProfile should return a user profile', (done: DoneFn) => {
    service.getProfile().subscribe(profile => {
      expect(profile).toBe(mockProfileResponse);
      done();
    });
    const request = httpMock.expectOne(
      `${APPCONFIG.base_url}${service.profileUrl}`
    );
    request.flush(mockProfileResponse);
  });

  it('Should use the GET method', () => {
    service.getProfile().subscribe();
    const req = httpMock.expectOne(
      `${APPCONFIG.base_url}${service.profileUrl}`
    );
    expect(req.request.method).toBe('GET');
  });

  it('updateProfile should successfully update user profile', () => {
    service.updateProfile({ first_name: 'Updated' }).subscribe(profile => {
      expect(profile.data.profile.user.first_name).toBe(
        mockUpdatedProfileResponse.data.profile.user.first_name
      );
    });
    storage.set('token', 'dummyAuthenticationToken');
    const request = httpMock.expectOne(
      `${APPCONFIG.base_url}${service.profileUrl}`
    );
    request.flush(mockUpdatedProfileResponse);
  });

  it('pushProfile should push the profile to userProfile$ on success', (done: DoneFn) => {
    service.userProfile$.subscribe(res => {
      expect(res).toBe(mockProfileResponse);
      done();
    });
    service.pushProfile();
    const req = httpMock.expectOne(
      `${APPCONFIG.base_url}${service.profileUrl}`
    );
    req.flush(mockProfileResponse);
  });

  it('pushProfile should emit error on userProfile$ when getProfile fails', (done: DoneFn) => {
    service.userProfile$.subscribe({
      error: err => {
        expect(err.status).toBe(500);
        done();
      }
    });
    service.pushProfile();
    const req = httpMock.expectOne(
      `${APPCONFIG.base_url}${service.profileUrl}`
    );
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('getDeposits should send GET request to transactions URL', () => {
    service.getDeposits().subscribe(res => {
      expect(res).toEqual([{ id: 1 }]);
    });
    const req = httpMock.expectOne(`${APPCONFIG.base_url}${service.depositeUrl}`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }]);
  });

  it('getPublicProfile should send GET request to user endpoint', () => {
    service.getPublicProfile(42).subscribe(res => {
      expect(res).toEqual({ data: { profile: { id: 42 } } });
    });
    const req = httpMock.expectOne(`${APPCONFIG.base_url}/auth/users/42/`);
    expect(req.request.method).toBe('GET');
    req.flush({ data: { profile: { id: 42 } } });
  });

  it('httpFormHeaders getter should return headers with Authorization and multipart content-type', () => {
    storage.set('token', 'my-form-token');
    const headersObj = service.httpFormHeaders;
    expect(headersObj.headers.get('Authorization')).toBe('Bearer my-form-token');
    expect(headersObj.headers.get('Content-Type')).toBe('multipart/form-data');
  });
});
