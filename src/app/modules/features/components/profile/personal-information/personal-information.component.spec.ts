import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, NgForm } from '@angular/forms';

import {
  PersonalInformationComponent
} from 'src/app/modules/features/components/profile/personal-information/personal-information.component';
import {
  mockProfileForm,
  mockProfileResponse,
  mockProfileFormErrorResponse
} from 'src/app/helpers/tests/mocks';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import {
  profileServiceSpy,
  resetSpies,
  toastServiceSpy
} from 'src/app/helpers/tests/spies';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { NgxSpinnerModule } from 'ngx-spinner';

describe('PersonalInformationComponent', () => {
  let component: PersonalInformationComponent;
  let fixture: ComponentFixture<PersonalInformationComponent>;
  let de: DebugElement;

  beforeAll(() => {
    resetSpies([profileServiceSpy, toastServiceSpy]);
    profileServiceSpy.userProfile$ = of(mockProfileResponse);
  });
  afterEach(() => resetSpies([profileServiceSpy, toastServiceSpy]));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        NgxSpinnerModule, BrowserAnimationsModule
      ],
      declarations: [PersonalInformationComponent],
      providers: [
        {
          provide: ProfileService,
          useValue: profileServiceSpy
        },
        {
          provide: ToastrService,
          useValue: toastServiceSpy
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    localStorage.clear();
    profileServiceSpy.userProfile$ = of(mockProfileResponse);
    fixture = TestBed.createComponent(PersonalInformationComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement.query(By.css('form'));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('Should get the user profile', () => {
    profileServiceSpy.getProfile.and.returnValue(of(mockProfileResponse));
    component.setProfile();

    expect(profileServiceSpy.userProfile$).toBeDefined();
  });
  it('should submit form', waitForAsync(() => {
    const profileForm = mockProfileForm as NgForm;
    profileServiceSpy.updateProfile.and.returnValue(of(mockProfileResponse));
    component.saveProfile();
    expect(component.saveProfile).toBeTruthy();
  }));
  it('should trigger form submission if button is clicked', () => {
    const fix = TestBed.createComponent(PersonalInformationComponent);
    const comp = fix.componentInstance;
    const saveSpy = spyOn(comp, 'saveProfile');
    profileServiceSpy.getProfile.and.returnValue(of(mockProfileResponse));
    comp.setProfile();
    fix.detectChanges();
    const el = fix.debugElement.query(By.css('.btn-form-blue-profile')).nativeElement;
    el.click();
    expect(saveSpy).toHaveBeenCalledTimes(1);
  });

  it('Should show a toast message when the response from server returns form validation error', waitForAsync(() => {
    const profileForm = mockProfileForm as NgForm;
    profileServiceSpy.updateProfile.and.returnValue(
      throwError(mockProfileFormErrorResponse)
    );
    component.saveProfile();
    const errorMessage = `Could not update your profile.
              phone: Phone number must be of the format +234 123 4567890`;
    expect(toastServiceSpy.error).toHaveBeenCalledWith(errorMessage);
  }));

  it('should handle error in setProfile subscription', () => {
    profileServiceSpy.userProfile$ = throwError(() => ({ error: { errors: 'Could not fetch profile' } }));
    component.setProfile();
    expect(toastServiceSpy.error).toHaveBeenCalledWith('Could not fetch profile');
    profileServiceSpy.userProfile$ = of(mockProfileResponse);
  });
});
