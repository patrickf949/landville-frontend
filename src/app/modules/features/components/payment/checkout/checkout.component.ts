import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { PropertyDetailService } from 'src/app/services/property-detail/property-detail.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { removeSubscription } from 'src/app/helpers/unsubscribe';

@Component({
  standalone: false,
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  property: any = null;
  slug: string = '';
  hasSavedCard: boolean = false;
  savedCardInfo: any = null;
  useSavedCard: boolean = false;

  paymentForm!: FormGroup;
  otpForm!: FormGroup;
  savedCardForm!: FormGroup;

  isSubmitted: boolean = false;
  isInternational: boolean = false;
  showOtpModal: boolean = false;
  currentFlwRef: string = '';
  paymentType: string = 'instalment';

  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private propertyService: PropertyDetailService,
    private profileService: ProfileService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.slug = params.get('slug') || '';
      if (this.slug) {
        this.fetchProperty(this.slug);
      }
    });

    this.checkUserProfile();
    this.initForms();
  }

  initForms(): void {
    this.paymentForm = this.fb.group({
      cardno: ['', [Validators.required, Validators.pattern(/^\d{16,19}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      expirymonth: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])$/)]],
      expiryyear: ['', [Validators.required, Validators.pattern(/^\d{2}$/)]],
      amount: ['', [Validators.required, Validators.min(1)]],
      save_card: [false],
      purpose: ['Buying', Validators.required],
      // Local payment PIN
      pin: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      // Foreign payment billing details
      billingzip: [''],
      billingcity: [''],
      billingaddress: [''],
      billingstate: [''],
      billingcountry: ['']
    });

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^\d+$/)]]
    });

    this.savedCardForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  checkUserProfile(): void {
    this.subscriptions.push(
      this.profileService.getProfile().subscribe({
        next: (response: any) => {
          const cardInfo = response?.data?.profile?.card_info;
          if (cardInfo && cardInfo.card_number && cardInfo.embedtoken) {
            this.hasSavedCard = true;
            this.savedCardInfo = cardInfo;
            this.useSavedCard = true;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('Could not fetch user profile for saved card check', err);
          this.cdr.detectChanges();
        }
      })
    );
  }

  fetchProperty(slug: string): void {
    this.spinner.show();
    this.subscriptions.push(
      this.propertyService.getProperty(slug).subscribe({
        next: (response: any) => {
          // Robust extraction of property from various API shapes
          if (response?.data?.property) {
            this.property = response.data.property;
          } else if (response?.property) {
            this.property = response.property;
          } else if (response?.data) {
            this.property = response.data;
          } else {
            this.property = response;
          }
          this.spinner.hide();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.toastr.error('Could not retrieve property details.');
          this.router.navigate(['/properties']);
          this.spinner.hide();
          this.cdr.detectChanges();
        }
      })
    );
  }

  setPaymentType(type: string): void {
    this.paymentType = type;
    const amountCtrl = this.paymentForm.get('amount');
    const savedAmountCtrl = this.savedCardForm.get('amount');

    if (type === 'full') {
      const price = this.property?.price || 0;
      amountCtrl?.setValue(price);
      amountCtrl?.disable();
      savedAmountCtrl?.setValue(price);
      savedAmountCtrl?.disable();
    } else {
      amountCtrl?.setValue('');
      amountCtrl?.enable();
      savedAmountCtrl?.setValue('');
      savedAmountCtrl?.enable();
    }
  }

  toggleCardType(isInt: boolean): void {
    this.isInternational = isInt;
    const pinControl = this.paymentForm.get('pin');
    const billingZip = this.paymentForm.get('billingzip');
    const billingCity = this.paymentForm.get('billingcity');
    const billingAddress = this.paymentForm.get('billingaddress');
    const billingState = this.paymentForm.get('billingstate');
    const billingCountry = this.paymentForm.get('billingcountry');

    if (isInt) {
      pinControl?.clearValidators();
      billingZip?.setValidators([Validators.required]);
      billingCity?.setValidators([Validators.required]);
      billingAddress?.setValidators([Validators.required]);
      billingState?.setValidators([Validators.required]);
      billingCountry?.setValidators([Validators.required]);
    } else {
      pinControl?.setValidators([Validators.required, Validators.pattern(/^\d{4}$/)]);
      billingZip?.clearValidators();
      billingCity?.clearValidators();
      billingAddress?.clearValidators();
      billingState?.clearValidators();
      billingCountry?.clearValidators();
    }

    pinControl?.updateValueAndValidity();
    billingZip?.updateValueAndValidity();
    billingCity?.updateValueAndValidity();
    billingAddress?.updateValueAndValidity();
    billingState?.updateValueAndValidity();
    billingCountry?.updateValueAndValidity();
  }

  processPayment(): void {
    this.isSubmitted = true;
    if (this.useSavedCard) {
      this.payWithSavedCard();
      return;
    }

    if (this.paymentForm.invalid) {
      this.toastr.warning('Please correct all validation errors before proceeding.');
      return;
    }

    this.spinner.show();
    const formVal = this.paymentForm.getRawValue();
    const payload: any = {
      cardno: formVal.cardno,
      cvv: formVal.cvv,
      expirymonth: formVal.expirymonth,
      expiryyear: formVal.expiryyear,
      amount: formVal.amount,
      save_card: formVal.save_card,
      purpose: formVal.purpose,
      property_id: this.property?.id
    };

    if (this.isInternational) {
      payload.billingzip = formVal.billingzip;
      payload.billingcity = formVal.billingcity;
      payload.billingaddress = formVal.billingaddress;
      payload.billingstate = formVal.billingstate;
      payload.billingcountry = formVal.billingcountry;

      this.subscriptions.push(
        this.paymentService.cardForeignPayment(payload).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            if (res?.message) {
              this.toastr.info('Redirecting to secure card authentication page...');
              window.location.href = res.message;
            } else {
              this.toastr.success('Payment initiated successfully.');
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.spinner.hide();
            this.toastr.error(err?.error?.message || 'Payment initiation failed.');
            this.cdr.detectChanges();
          }
        })
      );
    } else {
      payload.pin = formVal.pin;
      this.subscriptions.push(
        this.paymentService.cardPinPayment(payload).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            if (res?.flwRef) {
              this.currentFlwRef = res.flwRef;
              this.showOtpModal = true;
              this.toastr.success('OTP sent. Please verify to complete payment.');
            } else {
              this.toastr.success('Payment initiated successfully.');
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.spinner.hide();
            this.toastr.error(err?.error?.message || 'Payment initiation failed.');
            this.cdr.detectChanges();
          }
        })
      );
    }
  }

  payWithSavedCard(): void {
    if (this.savedCardForm.invalid) {
      this.toastr.warning('Please specify an amount to pay.');
      return;
    }

    this.spinner.show();
    const payload = {
      amount: this.savedCardForm.getRawValue().amount,
      purpose: 'Buying',
      property_id: this.property?.id
    };

    this.subscriptions.push(
      this.paymentService.tokenizedCardPayment(payload).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.toastr.success('Payment completed successfully using saved card!');
          this.router.navigate(['/profile']);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err?.error?.message || 'Payment with saved card failed.');
          this.cdr.detectChanges();
        }
      })
    );
  }

  submitOtp(): void {
    if (this.otpForm.invalid) {
      return;
    }

    this.spinner.show();
    const payload = {
      flwRef: this.currentFlwRef,
      otp: this.otpForm.value.otp,
      purpose: this.paymentForm.getRawValue().purpose || 'Buying',
      property_id: this.property?.id
    };

    this.subscriptions.push(
      this.paymentService.validateCardPayment(payload).subscribe({
        next: (res: any) => {
          this.spinner.hide();
          this.showOtpModal = false;
          this.toastr.success(res?.message || 'Payment completed successfully!');
          this.router.navigate(['/profile']);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(err?.error?.message || 'Verification failed. Please retry.');
          this.cdr.detectChanges();
        }
      })
    );
  }

  ngOnDestroy(): void {
    removeSubscription(this.subscriptions);
  }
}

