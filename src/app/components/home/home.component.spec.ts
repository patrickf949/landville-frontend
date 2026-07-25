import { RouterTestingModule } from '@angular/router/testing';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from 'src/app/components/home/home.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { FormsModule } from '@angular/forms';
import { ToastrService, ToastrModule } from 'ngx-toastr';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { Router, ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import {
  resetSpies,
  propertiesServiceSpy,
  toastServiceSpy
} from 'src/app/helpers/tests/spies';
import { of } from 'rxjs';

const trendingPropertiesData = {
  data: {
    property: [
      {
        id: 1,
        title: 'Trending House',
        slug: 'trending-house',
        price: 250000,
        image_main: 'main.jpg',
        address: { Street: 'Main Rd', City: 'Lagos', State: 'Lagos' }
      }
    ]
  }
};

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;

  beforeAll(() => resetSpies([propertiesServiceSpy]));
  afterEach(() => resetSpies([propertiesServiceSpy]));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        SharedModule,
        RouterTestingModule,
        ToastrModule.forRoot(),
        NoopAnimationsModule
      ],
      declarations: [HomeComponent],
      providers: [
        {
          provide: PropertiesService,
          useValue: propertiesServiceSpy
        },
        { provide: ToastrService, useValue: toastServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ title: 'LandVille Home', tags: [] })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    propertiesServiceSpy.getProperties.and.returnValue(of(trendingPropertiesData));
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  it('should create the component successfully and load trending properties', () => {
    expect(component).toBeTruthy();
    expect(propertiesServiceSpy.getProperties).toHaveBeenCalled();
    expect(component.trendingProperties.length).toBe(1);

    const cardTitle = fixture.debugElement.query(By.css('.card-title'));
    expect(cardTitle).toBeTruthy();
    expect(cardTitle.nativeElement.textContent).toContain('Trending House');
  });

  it('should submit search form and navigate to /properties with queryParams', () => {
    component.searchCity = 'Abuja';
    component.searchType = 'R';

    const form = fixture.debugElement.query(By.css('.search-form'));
    form.triggerEventHandler('submit', null);

    expect(router.navigate).toHaveBeenCalledWith(['/properties'], {
      queryParams: { city: 'Abuja', listing_type: 'R' }
    });
  });
});
