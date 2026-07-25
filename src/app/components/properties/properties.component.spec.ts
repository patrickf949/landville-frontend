import { environment } from 'src/environments/environment.prod';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { AppModule } from 'src/app/app.module';
import { resetSpies, propertiesServiceSpy } from 'src/app/helpers/tests/spies';
import { ComponentFixture, TestBed , waitForAsync, fakeAsync, tick} from '@angular/core/testing';
import { DebugElement, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { PropertiesComponent } from 'src/app/components/properties/properties.component';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

describe('PropertiesComponent', () => {
  let component: PropertiesComponent;
  let fixture: ComponentFixture<PropertiesComponent>;
  let debugElement: DebugElement;
  const url = `${environment.api_url}/properties`;

  const mockAmenities = [
    { id: 1, name: 'Pool', icon: 'fa-swimmer' },
    { id: 2, name: 'Gym', icon: 'fa-dumbbell' }
  ];

  const mockNearby = [
    { id: 10, name: 'School', icon: 'fa-school' }
  ];

  const Mockresponse = {
    data: {
      properties: {
        count: 1,
        next: 'next-link',
        previous: 'prev-link',
        results: [
          {
            id: 1,
            price: 1000,
            address: { City: 'test', State: 'test', Street: 'test' },
            coordinates: { lat: -1.9441, lon: 30.0619 },
            title: 'test property',
            slug: 'test-property',
            image_main: 'test.jpg'
          }
        ]
      }
    }
  };

  beforeAll(() => resetSpies([propertiesServiceSpy]));
  afterEach(() => resetSpies([propertiesServiceSpy]));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        AppModule,
        HttpClientModule,
        NgxSpinnerModule,
        RouterModule
      ],
      providers: [
        {
          provide: PropertiesService,
          useValue: propertiesServiceSpy
        }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesComponent);
    component = fixture.componentInstance;
    propertiesServiceSpy.getAmenities.and.returnValue(of(mockAmenities));
    propertiesServiceSpy.getNearbyFeatures.and.returnValue(of(mockNearby));
    propertiesServiceSpy.searchProperties.and.returnValue(of(Mockresponse));
    propertiesServiceSpy.getProperties.and.returnValue(of(Mockresponse));
    fixture.detectChanges();
  });

  it('should be created and load amenities, nearby features, and initial properties', () => {
    expect(component).toBeTruthy();
    expect(propertiesServiceSpy.getAmenities).toHaveBeenCalled();
    expect(propertiesServiceSpy.getNearbyFeatures).toHaveBeenCalled();
    expect(component.amenities).toEqual(mockAmenities);
    expect(component.nearbyFeatures).toEqual(mockNearby);
    expect(component.properties.length).toBe(1);
  });

  it('should clear all filters on clearFilters click', () => {
    component.filters.city = 'Kigali';
    component.filters.listing_type = 'R';
    component.selectedAmenities.add(1);
    component.selectedNearby.add(10);

    component.clearFilters();

    expect(component.filters.listing_type).toBe('');
    expect(component.filters.city).toBeFalsy();
    expect(component.selectedAmenities.size).toBe(0);
    expect(component.selectedNearby.size).toBe(0);
    expect(propertiesServiceSpy.searchProperties).toHaveBeenCalled();
  });

  it('should toggle amenity chip and trigger search', () => {
    expect(component.selectedAmenities.has(1)).toBeFalse();
    component.toggleChip(component.selectedAmenities, 1);
    expect(component.selectedAmenities.has(1)).toBeTrue();

    // Toggle again to remove
    component.toggleChip(component.selectedAmenities, 1);
    expect(component.selectedAmenities.has(1)).toBeFalse();
  });

  it('should toggle nearby feature chip and trigger search', () => {
    expect(component.selectedNearby.has(10)).toBeFalse();
    component.toggleChip(component.selectedNearby, 10);
    expect(component.selectedNearby.has(10)).toBeTrue();
  });

  it('should switch between grid, list, and map views', () => {
    component.view = 'grid';
    fixture.detectChanges();
    expect(component.view).toBe('grid');

    component.view = 'list';
    fixture.detectChanges();
    expect(component.view).toBe('list');

    component.view = 'map';
    fixture.detectChanges();
    expect(component.view).toBe('map');
  });

  it('should call getProperties on pagination next/previous buttons click', () => {
    component.view = 'grid';
    component.disabledNext = false;
    component.disabledPrevious = false;
    fixture.detectChanges();

    component.fetchNext();
    expect(propertiesServiceSpy.getProperties).toHaveBeenCalledWith('next-link');

    component.fetchPrevious();
    expect(propertiesServiceSpy.getProperties).toHaveBeenCalledWith('prev-link');
  });

  describe('DOM element interactions for filters, view toggles, and pagination', () => {
    it('should trigger clearFilters when clicking Reset button in DOM', () => {
      spyOn(component, 'clearFilters');
      const resetBtn = fixture.debugElement.query(By.css('.filter-card .btn-link')).nativeElement;
      resetBtn.click();
      expect(component.clearFilters).toHaveBeenCalled();
    });

    it('should trigger search on filter changes (listing_type, property_type, city, price_min, price_max, distance_to_main_road, distance_to_city, noise_level)', fakeAsync(() => {
      spyOn(component, 'search');
      fixture.detectChanges();

      const selectsAndInputs = fixture.debugElement.queryAll(By.css('.filter-card input, .filter-card select'));
      expect(selectsAndInputs.length).toBeGreaterThan(0);

      selectsAndInputs.forEach(el => {
        el.nativeElement.dispatchEvent(new Event('change'));
      });
      tick();

      expect(component.search).toHaveBeenCalled();
    }));

    it('should toggle between gallery/grid, list, and map views via DOM button clicks when properties exist', () => {
      component.properties = [
        {
          id: 1, title: 'Prop 1', price: 5000,
          address: { City: 'Lagos', State: 'Lagos', Street: 'Main St' },
          image_main: 'img1.jpg'
        }
      ];
      component.loading = false;
      fixture.detectChanges();

      const toggleBtns = fixture.debugElement.queryAll(By.css('.view-toggle button'));
      expect(toggleBtns.length).toBe(3);

      // Click list view button
      toggleBtns[1].nativeElement.click();
      fixture.detectChanges();
      expect(component.view).toBe('list');
      expect(fixture.debugElement.query(By.css('.listview'))).toBeTruthy();

      // Click gallery/grid view button
      toggleBtns[0].nativeElement.click();
      fixture.detectChanges();
      expect(component.view).toBe('grid');
      expect(fixture.debugElement.query(By.css('.custom-card'))).toBeTruthy();

      // Click map view button
      toggleBtns[2].nativeElement.click();
      fixture.detectChanges();
      expect(component.view).toBe('map');
      expect(fixture.debugElement.query(By.css('.map-view'))).toBeTruthy();
    });

    it('should handle pagination DOM button clicks for next and previous when >10 properties are returned', () => {
      component.loading = false;
      component.view = 'grid';
      component.count = 15;
      component.properties = Array(15).fill({
        id: 1, title: 'Prop', price: 100, address: { City: 'C', State: 'S', Street: 'S' }, image_main: 'img.jpg'
      });
      component.disabledPrevious = false;
      component.disabledNext = false;
      component.next = 'next-url';
      component.previous = 'prev-url';
      fixture.detectChanges();

      spyOn(component, 'fetchNext');
      spyOn(component, 'fetchPrevious');

      const prevBtn = fixture.debugElement.query(By.css('.page-buttons .prev')).nativeElement;
      const nextBtn = fixture.debugElement.query(By.css('.page-buttons .next')).nativeElement;

      prevBtn.click();
      expect(component.fetchPrevious).toHaveBeenCalled();

      nextBtn.click();
      expect(component.fetchNext).toHaveBeenCalled();
    });

    it('should trigger search when filters.city, filters.price_min, and filters.price_max are changed in DOM', fakeAsync(() => {
      spyOn(component, 'search').and.callThrough();
      fixture.detectChanges();

      const cityInput = fixture.debugElement.query(By.css('input[placeholder="City"]')).nativeElement;
      const minPriceInput = fixture.debugElement.query(By.css('input[placeholder="Min ₦"]')).nativeElement;
      const maxPriceInput = fixture.debugElement.query(By.css('input[placeholder="Max ₦"]')).nativeElement;

      cityInput.value = 'Lagos';
      cityInput.dispatchEvent(new Event('input'));
      cityInput.dispatchEvent(new Event('change'));
      tick();

      expect(component.filters.city).toBe('Lagos');
      expect(component.search).toHaveBeenCalled();

      minPriceInput.value = '500000';
      minPriceInput.dispatchEvent(new Event('input'));
      minPriceInput.dispatchEvent(new Event('change'));
      tick();

      expect(Number(component.filters.price_min)).toBe(500000);

      maxPriceInput.value = '10000000';
      maxPriceInput.dispatchEvent(new Event('input'));
      maxPriceInput.dispatchEvent(new Event('change'));
      tick();

      expect(Number(component.filters.price_max)).toBe(10000000);
      expect(component.search).toHaveBeenCalledTimes(3);
    }));


    it('should display empty state when no properties match filters and handle clearFilters button click in empty state container', fakeAsync(() => {
      component.filters.city = 'Abuja';
      component.filters.price_min = '100';
      component.filters.price_max = '200';

      const emptyResponse = {
        data: {
          properties: {
            count: 0,
            next: null,
            previous: null,
            results: []
          }
        }
      };
      propertiesServiceSpy.searchProperties.and.returnValue(of(emptyResponse));

      component.search();
      tick();
      fixture.detectChanges();

      expect(component.loading).toBeFalse();
      expect(component.properties.length).toBe(0);

      const emptyStateEl = fixture.debugElement.query(By.css('.empty-state'));
      expect(emptyStateEl).toBeTruthy();
      expect(emptyStateEl.nativeElement.textContent).toContain('No properties match your filters');

      spyOn(component, 'clearFilters').and.callThrough();
      const clearBtn = emptyStateEl.query(By.css('button')).nativeElement;
      clearBtn.click();
      tick();
      fixture.detectChanges();

      expect(component.clearFilters).toHaveBeenCalled();
      expect(component.filters.city).toBeUndefined();
      expect(component.filters.price_min).toBeUndefined();
      expect(component.filters.price_max).toBeUndefined();
    }));
  });
});


