import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientReviewService } from 'src/app/services/client-review.service';

describe('ClientReviewService', () => {
  let httpTestingController: HttpTestingController;
  let service: ClientReviewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientReviewService],
      imports: [HttpClientTestingModule]
    });
    httpTestingController = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ClientReviewService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call createClientReview with the correct URL and payload', () => {
    service.createClientReview(10, { review: 'Feedback' }).subscribe(res => {
      expect(res).toEqual({ message: 'success' });
    });
    const req = httpTestingController.expectOne(`${environment.api_url}/auth/10/reviews/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ review: 'Feedback' });
    req.flush({ message: 'success' });
  });

  it('should handle error when createClientReview fails', () => {
    let error: any;
    service.createClientReview(5000, { review: 'Feedback--' }).subscribe({
      error: err => error = err
    });
    const req = httpTestingController.expectOne(`${environment.api_url}/auth/5000/reviews/`);
    expect(req.request.method).toBe('POST');
    req.flush('Error', { status: 400, statusText: 'Bad Request' });
    expect(error).toBeTruthy();
    expect(error.status).toBe(400);
  });
});
