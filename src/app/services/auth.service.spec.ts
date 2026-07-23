import { TestBed } from '@angular/core/testing';
import { AuthService } from 'src/app/services/auth.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { localStorageSpy } from '../helpers/tests/spies';

describe('AuthService', () => {
  let service: AuthService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: LocalStorageService, useValue: localStorageSpy }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should be falsy if there is no token set', () => {
    localStorageSpy.get.and.returnValue(null);
    expect(service.isLoggedIn()).toBeFalsy();
  });
  it('should return false if a token is not valid JWT', () => {
    localStorageSpy.get.and.returnValue('test');
    expect(service.isLoggedIn()).toEqual(false);
  });
  it('should return false when the token is expired', () => {
    localStorageSpy.get.and.returnValue(
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IkFoZWJ3YTEiLCJlbWFpbCI6ImNyeWNldHJ1bHlAZ21haWwuY29tIiwiZXhwIjoxNTUxNzc2Mzk0fQ.PFimaBvSaxR_cKwLmeRMod7LHkhNTcem22IXTrrg7Ko'
    );
    expect(service.isLoggedIn()).toEqual(false);
  });
});
