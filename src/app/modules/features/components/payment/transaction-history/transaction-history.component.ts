import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from 'src/app/services/payment/payment.service';
import { removeSubscription } from 'src/app/helpers/unsubscribe';

@Component({
  standalone: false,
  selector: 'app-transaction-history',
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss']
})
export class TransactionHistoryComponent implements OnInit, OnDestroy {
  transactions: any[] = [];
  deposits: any[] = [];
  activeTab: 'properties' | 'deposits' = 'properties';
  isLoading: boolean = false;
  expandedRowIndex: number | null = null;

  subscriptions: Subscription[] = [];

  constructor(
    private paymentService: PaymentService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkRedirectStatus();
    this.fetchTransactions();
    this.fetchDeposits();
  }

  checkRedirectStatus(): void {
    this.subscriptions.push(
      this.route.queryParams.subscribe(params => {
        const status = params['status'];
        const message = params['message'];

        if (status && message) {
          if (status === 'success') {
            this.toastr.success(message, 'Payment Successful');
          } else {
            this.toastr.error(message, 'Payment Failed');
          }
          // Clear query parameters
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { status: null, message: null },
            queryParamsHandling: 'merge'
          });
        }
      })
    );
  }

  fetchTransactions(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    this.subscriptions.push(
      this.paymentService.getTransactions().subscribe({
        next: (res: any) => {
          this.transactions = res?.data?.transactions || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('Error fetching transactions:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  fetchDeposits(): void {
    this.subscriptions.push(
      this.paymentService.getDeposits().subscribe({
        next: (res: any) => {
          this.deposits = res?.results || res?.data || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('Error fetching deposits:', err);
          this.cdr.detectChanges();
        }
      })
    );
  }

  toggleRow(index: number): void {
    if (this.expandedRowIndex === index) {
      this.expandedRowIndex = null;
    } else {
      this.expandedRowIndex = index;
    }
  }

  switchTab(tab: 'properties' | 'deposits'): void {
    this.activeTab = tab;
    this.expandedRowIndex = null;
  }

  ngOnDestroy(): void {
    removeSubscription(this.subscriptions);
  }
}
