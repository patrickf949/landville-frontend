import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PaymentService } from './payment.service';
import { APPCONFIG } from 'src/app/config';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;
  const baseUrl = `${APPCONFIG.base_url}/transactions`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentService]
    });
    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send POST request for cardPinPayment', () => {
    const mockPayload = { card: '1234' };
    service.cardPinPayment(mockPayload).subscribe(res => {
      expect(res).toEqual({ status: 'success' });
    });
    const req = httpMock.expectOne(`${baseUrl}/card-pin/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPayload);
    req.flush({ status: 'success' });
  });

  it('should send POST request for cardForeignPayment', () => {
    const mockPayload = { card: '5678' };
    service.cardForeignPayment(mockPayload).subscribe(res => {
      expect(res).toEqual({ status: 'success' });
    });
    const req = httpMock.expectOne(`${baseUrl}/card-foreign/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPayload);
    req.flush({ status: 'success' });
  });

  it('should send POST request for validateCardPayment', () => {
    const mockPayload = { otp: '123456' };
    service.validateCardPayment(mockPayload).subscribe(res => {
      expect(res).toEqual({ status: 'valid' });
    });
    const req = httpMock.expectOne(`${baseUrl}/validate-card/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPayload);
    req.flush({ status: 'valid' });
  });

  it('should send POST request for tokenizedCardPayment', () => {
    const mockPayload = { token: 'token123' };
    service.tokenizedCardPayment(mockPayload).subscribe(res => {
      expect(res).toEqual({ status: 'success' });
    });
    const req = httpMock.expectOne(`${baseUrl}/tokenized-card/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPayload);
    req.flush({ status: 'success' });
  });

  it('should send GET request for getTransactions', () => {
    service.getTransactions().subscribe(res => {
      expect(res).toEqual([{ id: 1 }]);
    });
    const req = httpMock.expectOne(`${baseUrl}/`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1 }]);
  });

  it('should send GET request for getDeposits', () => {
    service.getDeposits().subscribe(res => {
      expect(res).toEqual([{ id: 10 }]);
    });
    const req = httpMock.expectOne(`${baseUrl}/my-deposit/`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 10 }]);
  });
});
