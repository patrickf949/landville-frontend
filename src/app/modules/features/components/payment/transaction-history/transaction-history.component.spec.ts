import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

import { TransactionHistoryComponent } from './transaction-history.component';
import { PaymentService } from 'src/app/services/payment/payment.service';

describe('TransactionHistoryComponent', () => {
  let component: TransactionHistoryComponent;
  let fixture: ComponentFixture<TransactionHistoryComponent>;
  let paymentServiceSpy: jasmine.SpyObj<PaymentService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockTransactions = [
    {
      id: 1,
      title: 'Luxury Villa',
      price: 100000,
      total_amount_paid: 50000,
      balance: 50000,
      percentage_completion: 50,
      deposits: [
        { id: 101, amount: 50000, date: '2026-07-01' }
      ]
    }
  ];
  const mockDeposits = [
    { id: 10, amount: 2000, created_at: '2026-07-02', references: { txRef: 'REF123' }, savingAccount: true }
  ];

  beforeEach(async () => {
    paymentServiceSpy = jasmine.createSpyObj('PaymentService', ['getTransactions', 'getDeposits']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    paymentServiceSpy.getTransactions.and.returnValue(of({ data: { transactions: mockTransactions } }));
    paymentServiceSpy.getDeposits.and.returnValue(of({ results: mockDeposits }));

    await TestBed.configureTestingModule({
      declarations: [ TransactionHistoryComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: PaymentService, useValue: paymentServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ status: 'success', message: 'Payment completed' })
          }
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and fetch transactions & deposits on init', () => {
    expect(component).toBeTruthy();
    expect(paymentServiceSpy.getTransactions).toHaveBeenCalled();
    expect(paymentServiceSpy.getDeposits).toHaveBeenCalled();
    expect(component.transactions).toEqual(mockTransactions);
    expect(component.deposits).toEqual(mockDeposits);
    expect(toastrSpy.success).toHaveBeenCalledWith('Payment completed', 'Payment Successful');
  });

  it('should switch tab between properties and deposits on button click', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn-tab'));
    expect(buttons.length).toBe(2);

    // Click deposits tab button
    buttons[1].nativeElement.click();
    fixture.detectChanges();

    expect(component.activeTab).toBe('deposits');

    // Click properties tab button
    buttons[0].nativeElement.click();
    fixture.detectChanges();

    expect(component.activeTab).toBe('properties');
  });

  it('should toggle expanded row on row click and show deposit breakdown', () => {
    expect(component.expandedRowIndex).toBeNull();

    const row = fixture.debugElement.query(By.css('.transaction-row'));
    row.nativeElement.click();
    fixture.detectChanges();

    expect(component.expandedRowIndex).toBe(0);

    const expandedRow = fixture.debugElement.query(By.css('.expanded-deposits-row'));
    expect(expandedRow).toBeTruthy();
    expect(expandedRow.nativeElement.textContent).toContain('Deposit Breakdown for Luxury Villa');

    // Click again to close
    row.nativeElement.click();
    fixture.detectChanges();

    expect(component.expandedRowIndex).toBeNull();
  });

  it('should render no transactions container when transactions array is empty', () => {
    component.isLoading = false;
    component.activeTab = 'properties';
    component.transactions = [];
    (component as any).cdr.detectChanges();
    fixture.detectChanges();

    const noTxEl = fixture.debugElement.query(By.css('h4'));
    expect(noTxEl).toBeTruthy();
    expect(noTxEl.nativeElement.textContent).toContain('No payments found');
  });

  it('should render deposits table when activeTab is deposits and deposits exist', () => {
    component.isLoading = false;
    component.activeTab = 'deposits';
    component.deposits = mockDeposits;
    (component as any).cdr.detectChanges();
    fixture.detectChanges();

    const depTable = fixture.debugElement.query(By.css('.table-hover'));
    expect(depTable).toBeTruthy();
  });

  it('should render no deposits fallback when activeTab is deposits and deposits is empty', () => {
    component.isLoading = false;
    component.deposits = [];
    component.switchTab('deposits');
    fixture.detectChanges();

    expect(component.activeTab).toBe('deposits');
    expect(component.deposits.length).toBe(0);
  });

  it('should handle error when fetching transactions fails', () => {
    paymentServiceSpy.getTransactions.and.returnValue(throwError(() => new Error('Error')));
    component.fetchTransactions();
    expect(component.isLoading).toBeFalse();
  });
});
