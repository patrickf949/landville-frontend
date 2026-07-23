import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APPCONFIG } from 'src/app/config';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = `${APPCONFIG.base_url}/transactions`;

  constructor(private http: HttpClient) {}

  cardPinPayment(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/card-pin/`, data);
  }

  cardForeignPayment(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/card-foreign/`, data);
  }

  validateCardPayment(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/validate-card/`, data);
  }

  tokenizedCardPayment(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tokenized-card/`, data);
  }

  getTransactions(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/`);
  }

  getDeposits(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/my-deposit/`);
  }
}
