import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientReviewsService } from './client-reviews.service';
import { environment } from 'src/environments/environment';

describe('ClientReviewsService', () => {
  let service: ClientReviewsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientReviewsService]
    });
    service = TestBed.inject(ClientReviewsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch client reviews via GET request', () => {
    const mockReview = { id: 1, comment: 'Great service' };
    service.getReviews(10).subscribe(res => {
      expect(res).toEqual(mockReview);
    });

    const req = httpMock.expectOne(`${environment.api_url}/auth/10/reviews/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockReview);
  });
});
