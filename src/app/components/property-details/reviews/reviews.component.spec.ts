import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ClientReviewsService } from 'src/app/services/client-reviews/client-reviews.service';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReviewsComponent } from 'src/app/components/property-details/reviews/reviews.component';
import { httpClientSpy, reviewsSpy, resetSpies } from 'src/app/helpers/tests/spies';
import { of, throwError } from 'rxjs';
import { NgxSpinnerModule } from 'ngx-spinner';
import { mockReviewsResponse } from 'src/app/helpers/tests/mocks';

describe('ReviewsComponent', () => {
  let component: ReviewsComponent;
  let fixture: ComponentFixture<ReviewsComponent>;
  beforeAll(() => resetSpies([reviewsSpy]));
  afterEach(() => resetSpies([reviewsSpy]));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ReviewsComponent],
        imports: [HttpClientModule, NgxSpinnerModule,
            RouterTestingModule.withRoutes([{ path: '**', component: ReviewsComponent }, ])
      ],
      providers: [
        {
          provide: HttpClient,
          useValue: httpClientSpy
        },
        {
          provide: ClientReviewsService,
          useValue: reviewsSpy
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewsComponent);
    component = fixture.componentInstance;
    reviewsSpy.getReviews.and.returnValue(of(mockReviewsResponse));
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should go to next page on button click', async () => {
    spyOn(component, 'getMoreReviews');
    const debugElement = fixture.nativeElement.querySelector('#review-btn');
    debugElement.dispatchEvent(new Event('click'));
    await fixture.whenStable();
    expect(component.getMoreReviews).toHaveBeenCalled();
  });

  it('should hide spinner when getReviews throws an error in fetchReviews', () => {
    spyOn(component.spinner, 'show');
    spyOn(component.spinner, 'hide');
    reviewsSpy.getReviews.and.returnValue(throwError(() => new Error('API error')));

    component.fetchReviews();

    expect(component.spinner.show).toHaveBeenCalled();
    expect(component.spinner.hide).toHaveBeenCalled();
  });

  it('should show spinner, navigate to reviews page, and hide spinner when getMoreReviews is called', () => {
    spyOn(component.spinner, 'show');
    spyOn(component.spinner, 'hide');
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.getMoreReviews(123);

    expect(component.spinner.show).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/auth', 123, 'reviews']);
    expect(component.spinner.hide).toHaveBeenCalled();
  });
});

