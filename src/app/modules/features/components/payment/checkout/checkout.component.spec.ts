import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CheckoutComponent } from './checkout.component';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { PropertyDetailService } from 'src/app/services/property-detail/property-detail.service';
import { ProfileService } from 'src/app/services/profile/profile.service';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;
  let propertyDetailServiceSpy: jasmine.SpyObj<PropertyDetailService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let spinnerSpy: jasmine.SpyObj<NgxSpinnerService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockProperty = {
    id: 1,
    slug: 'test-slug',
    title: 'Test Property',
    price: 100000
  };

  beforeEach(async () => {
    paymentServiceSpy = jasmine.createSpyObj('PaymentService', [
      'cardPinPayment',
      'cardForeignPayment',
      'validateCardPayment',
      'tokenizedCardPayment'
    ]);
    propertyDetailServiceSpy = jasmine.createSpyObj('PropertyDetailService', ['getProperty']);
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getProfile']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);
    spinnerSpy = jasmine.createSpyObj('NgxSpinnerService', ['show', 'hide']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    propertyDetailServiceSpy.getProperty.and.returnValue(of({ data: { property: mockProperty } }));
    profileServiceSpy.getProfile.and.returnValue(of({ data: { profile: { card_info: null }, message: 'ok' } } as any));

    await TestBed.configureTestingModule({
      declarations: [ CheckoutComponent ],
      imports: [ ReactiveFormsModule, RouterTestingModule ],
      providers: [
        { provide: PaymentService, useValue: paymentServiceSpy },
        { provide: PropertyDetailService, useValue: propertyDetailServiceSpy },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: NgxSpinnerService, useValue: spinnerSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(new Map([['slug', 'test-slug']]))
          }
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize forms and property data', () => {
    expect(component).toBeTruthy();
    expect(propertyDetailServiceSpy.getProperty).toHaveBeenCalledWith('test-slug');
    expect(component.property).toEqual(mockProperty);
    expect(component.paymentForm).toBeDefined();
    expect(component.otpForm).toBeDefined();
    expect(component.savedCardForm).toBeDefined();
  });

  it('should set saved card info if user profile contains card_info', () => {
    const cardInfo = { card_number: '****1234', embedtoken: 'token123' };
    profileServiceSpy.getProfile.and.returnValue(of({ data: { profile: { card_info: cardInfo }, message: 'ok' } } as any));

    component.checkUserProfile();

    expect(component.hasSavedCard).toBeTrue();
    expect(component.savedCardInfo).toEqual(cardInfo);
    expect(component.useSavedCard).toBeTrue();
  });

  it('should switch payment type between full and instalment', () => {
    component.setPaymentType('full');
    expect(component.paymentType).toBe('full');
    expect(component.paymentForm.get('amount')?.value).toBe(100000);
    expect(component.paymentForm.get('amount')?.disabled).toBeTrue();

    component.setPaymentType('instalment');
    expect(component.paymentType).toBe('instalment');
    expect(component.paymentForm.get('amount')?.value).toBe('');
    expect(component.paymentForm.get('amount')?.enabled).toBeTrue();
  });

  it('should toggle card type between local and international', () => {
    component.toggleCardType(true);
    expect(component.isInternational).toBeTrue();
    expect(component.paymentForm.get('billingcity')?.validator).toBeDefined();

    component.toggleCardType(false);
    expect(component.isInternational).toBeFalse();
    expect(component.paymentForm.get('pin')?.validator).toBeDefined();
  });

  it('should warn when processing payment with invalid form', () => {
    component.useSavedCard = false;
    component.paymentForm.patchValue({ cardno: '' }); // Invalid
    component.processPayment();
    expect(toastrSpy.warning).toHaveBeenCalledWith('Please correct all validation errors before proceeding.');
  });

  it('should process local card pin payment successfully and open OTP modal', fakeAsync(() => {
    component.useSavedCard = false;
    component.isInternational = false;
    component.paymentForm.patchValue({
      cardno: '1234567812345678',
      cvv: '123',
      expirymonth: '05',
      expiryyear: '25',
      amount: 50000,
      pin: '1234',
      purpose: 'Buying'
    });

    paymentServiceSpy.cardPinPayment.and.returnValue(of({ flwRef: 'FLW123456' }));

    component.processPayment();
    tick();

    expect(paymentServiceSpy.cardPinPayment).toHaveBeenCalled();
    expect(component.currentFlwRef).toBe('FLW123456');
    expect(component.showOtpModal).toBeTrue();
    expect(toastrSpy.success).toHaveBeenCalledWith('OTP sent. Please verify to complete payment.');
  }));

  it('should process foreign card payment successfully', fakeAsync(() => {
    component.useSavedCard = false;
    component.toggleCardType(true);
    component.paymentForm.patchValue({
      cardno: '1234567812345678',
      cvv: '123',
      expirymonth: '05',
      expiryyear: '25',
      amount: 50000,
      purpose: 'Buying',
      billingzip: '12345',
      billingcity: 'NYC',
      billingaddress: 'Wall Street',
      billingstate: 'NY',
      billingcountry: 'US'
    });

    paymentServiceSpy.cardForeignPayment.and.returnValue(of({ message: '' }));

    component.processPayment();
    tick();

    expect(paymentServiceSpy.cardForeignPayment).toHaveBeenCalled();
    expect(toastrSpy.success).toHaveBeenCalledWith('Payment initiated successfully.');
  }));

  it('should process payment with saved card', fakeAsync(() => {
    component.useSavedCard = true;
    component.savedCardForm.patchValue({ amount: 50000 });
    paymentServiceSpy.tokenizedCardPayment.and.returnValue(of({ status: 'success' }));

    component.processPayment();
    tick();

    expect(paymentServiceSpy.tokenizedCardPayment).toHaveBeenCalledWith({
      amount: 50000,
      purpose: 'Buying',
      property_id: 1
    });
    expect(toastrSpy.success).toHaveBeenCalledWith('Payment completed successfully using saved card!');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  }));

  it('should submit OTP and navigate to profile on success', fakeAsync(() => {
    component.currentFlwRef = 'FLW123456';
    component.otpForm.patchValue({ otp: '123456' });
    paymentServiceSpy.validateCardPayment.and.returnValue(of({ message: 'Success' }));

    component.submitOtp();
    tick();

    expect(paymentServiceSpy.validateCardPayment).toHaveBeenCalledWith({
      flwRef: 'FLW123456',
      otp: '123456',
      purpose: 'Buying',
      property_id: 1
    });
    expect(component.showOtpModal).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  }));
});
