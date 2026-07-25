import { TestBed, inject, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { Observable, Observer, of } from 'rxjs';
import { LoginFormComponent } from 'src/app/modules/authentication/components/login/login-form/login-form.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoginService } from 'src/app/services/login/login.service';
import { AppModule } from 'src/app/app.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { toastServiceSpy, httpServiceSpy } from 'src/app/helpers/tests/spies';
import { HttpClient } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpService } from 'src/app/services/http.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
describe('LoginService', () => {
  let httpTestingController: HttpTestingController;
  let logInService: LoginService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginFormComponent],
      providers: [
        LoginService,
        { provide: ToastrService, useValue: toastServiceSpy },
        { provide: HttpService, useValue: httpServiceSpy},
        LocalStorageService
      ],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        FormsModule,
        ToastrModule.forRoot(),
        NgxSpinnerModule],

    });
    httpTestingController = TestBed.inject(HttpTestingController);
    logInService = TestBed.inject(LoginService);
  });

  function setup() {
    const fixture = TestBed.createComponent(LoginFormComponent);
    const userService = fixture.debugElement.injector.get(LoginService);
    return { fixture, userService };
  }
  it('it should be initialized', inject([LoginService], (loginService: LoginService) => {
    expect(loginService).toBeTruthy();
  }));

  it('should use the service', () => {
    const { userService } = setup();
    const mockUser = { name: 'Serem' };
    spyOn(userService, 'login').and.returnValue(of(mockUser));
    userService.login({} as any).subscribe(user => {
      expect(user).toEqual(mockUser);
    });
  });
  it('should be created', () => {
    const service: LoginService = TestBed.inject(LoginService);
    expect(service).toBeTruthy();
  });

  it(
    'should perform login correctly', () => {
      const responseObject = {
        success: true,
        message: 'login was successful'
      };
      const user = { email: 'test@example.com', password: 'testpassword' };
      httpServiceSpy.makeRequestWithData.and.returnValue(of(responseObject));
      logInService.login(user).subscribe(data => {
        expect(data).toEqual(responseObject);
      });
    }
  );

  it('should successfully logout a user', () => {
    const data = {
      message: 'Successful Logout'
    };
    httpServiceSpy.makeRequestWithData.and.returnValue(of(data));
    logInService.logoutUser().subscribe((payload) => {
      expect(payload).toEqual(data);
    });
  });
});
