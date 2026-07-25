import { mockReviewsResponse, reviewResponse } from 'src/app/helpers/tests/mocks';
import { ClientReviewsService } from 'src/app/services/client-reviews/client-reviews.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { httpClientSpy, toastServiceSpy, reviewsSpy, resetSpies } from 'src/app/helpers/tests/spies';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientReviewsComponent } from 'src/app/components/client-reviews/client-reviews.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { NgxSpinnerModule } from 'ngx-spinner';
import { environment } from 'src/environments/environment';

describe('ClientReviewsComponent', () => {
  let component: ClientReviewsComponent;
  let fixture: ComponentFixture<ClientReviewsComponent>;
  let debugElement: DebugElement;
  const url = `${environment.api_url}/auth/1/reviews`;

  beforeAll(() => resetSpies([reviewsSpy]));
  afterEach(() => resetSpies([reviewsSpy]));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ClientReviewsComponent],
      imports: [
        HttpClientModule,
        NgxSpinnerModule,
        RouterTestingModule.withRoutes([{ path: '**', component: ClientReviewsComponent }, ]),
      ],
      providers: [
        {
          provide: ClientReviewsService,
          useValue: reviewsSpy
        },
        {
          provide: HttpClient,
          useValue: httpClientSpy
        },

        {
          provide: ToastrService,
          useValue: toastServiceSpy
        },
      ]
    })
      .compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(ClientReviewsComponent);
    component = fixture.componentInstance;
    reviewsSpy.getReviews.and.returnValue(of(mockReviewsResponse));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should go to next page on button click', () => {
    debugElement = fixture.debugElement.query(By.css('.next'));
    debugElement.triggerEventHandler('click', null);
    expect(reviewsSpy.getReviews).toHaveBeenCalled();
  });

  it('should go to previous page on button click', () => {
    debugElement = fixture.debugElement;
    debugElement.query(By.css('.prev')).triggerEventHandler('click', null);
    expect(reviewsSpy.getReviews).toHaveBeenCalled();
  });

  it('should set the components next property when reviews exist', () => {
    reviewsSpy.getReviews.and.returnValue(of(reviewResponse));
    component.fetchReviews(url);
    expect(component.next).toEqual(reviewResponse.next);
    expect(component.prev).toEqual(reviewResponse.previous);
  });
  it('should throw a toast error', () => {
    reviewsSpy.getReviews.and.returnValue(
      throwError({ errors: { details: 'No reviews yet' } })
    );
    component.fetchReviews(url);
    expect(toastServiceSpy.error).toHaveBeenCalledWith(
      'Details: No reviews yet'
    );
  });

  it('should render reviewer profile image when image exists in review', () => {
    const images = fixture.debugElement.queryAll(By.css('.profilepic'));
    expect(images.length).toBeGreaterThan(0);
    expect(images[0].nativeElement.getAttribute('src')).toBe('http://res.cloudinary.com/landville/image/upload/v1567094295/yhhaucrvkdgjqiizef6n.png');
  });

  it('should render default profileImage when reviewer image is null or undefined', () => {
    const responseWithNoImage = {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 1,
          created_at: '2019-08-29T07:10:20.158541Z',
          review: 'Great service',
          reviewer: {
            first_name: 'John',
            last_name: 'Doe',
            image: null
          }
        }
      ]
    };
    reviewsSpy.getReviews.and.returnValue(of(responseWithNoImage));
    component.fetchReviews(1);
    fixture.detectChanges();

    const images = fixture.debugElement.queryAll(By.css('.profilepic'));
    expect(images.length).toBe(1);
    expect(images[0].nativeElement.getAttribute('src')).toBe('assets/img/people.png');
  });
});

