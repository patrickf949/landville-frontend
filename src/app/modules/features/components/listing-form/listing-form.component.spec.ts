import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ListingFormComponent } from './listing-form.component';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('ListingFormComponent', () => {
  let component: ListingFormComponent;
  let fixture: ComponentFixture<ListingFormComponent>;
  let propertiesServiceSpy: jasmine.SpyObj<PropertiesService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockActivatedRoute = {
    snapshot: { params: {} }
  };

  beforeEach(async () => {
    propertiesServiceSpy = jasmine.createSpyObj('PropertiesService', [
      'getAmenities',
      'getNearbyFeatures',
      'getProperty',
      'createProperty',
      'updateProperty',
      'deletePropertyResource'
    ]);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Default mock returns
    propertiesServiceSpy.getAmenities.and.returnValue(of([{ id: 1, name: 'Pool', icon: 'pool', group: 'S' }]));
    propertiesServiceSpy.getNearbyFeatures.and.returnValue(of([{ id: 1, name: 'School', icon: 'school' }]));

    await TestBed.configureTestingModule({
      declarations: [ ListingFormComponent ],
      imports: [ ReactiveFormsModule, RouterTestingModule ],
      providers: [
        { provide: PropertiesService, useValue: propertiesServiceSpy },
        { provide: ToastrService, useValue: toastrSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  });

  beforeEach(() => {
    mockActivatedRoute.snapshot.params = {};
    fixture = TestBed.createComponent(ListingFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load amenities and nearby features on init', () => {
    expect(propertiesServiceSpy.getAmenities).toHaveBeenCalled();
    expect(propertiesServiceSpy.getNearbyFeatures).toHaveBeenCalled();
    expect(component.amenities.length).toBe(1);
    expect(component.nearbyFeatures.length).toBe(1);
  });

  describe('Edit Mode', () => {
    it('should load property data if editSlug is present in route', fakeAsync(() => {
      mockActivatedRoute.snapshot.params = { slug: 'test-property' };
      const mockPropertyData = {
        title: 'Test House',
        listing_type: 'S',
        property_type: 'H',
        price: 500000,
        description: 'A nice test house description that is long enough.',
        address: { City: 'Test City', State: 'Test State', Street: 'Test Street' },
        coordinates: { lat: 10, lon: 20 },
        bedrooms: 3,
        bathrooms: 2,
        garages: 1,
        lot_size: 1000,
        amenities: [{ id: 1 }],
        nearby: [{ id: 1 }],
        image_main: 'main.jpg',
        image_others: ['other1.jpg']
      };
      propertiesServiceSpy.getProperty.and.returnValue(of({ data: { property: mockPropertyData } }));
      
      // Re-create component to trigger ngOnInit with new params
      fixture = TestBed.createComponent(ListingFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(propertiesServiceSpy.getProperty).toHaveBeenCalledWith('test-property');
      expect(component.form.value.title).toBe('Test House');
      expect(component.selectedAmenities.has(1)).toBeTrue();
      expect(component.selectedNearby.has(1)).toBeTrue();
      expect(component.existingMainPhoto).toBe('main.jpg');
      expect(component.existingOtherPhotos.length).toBe(1);
    }));

    it('should handle error when loadPropertyData fails', fakeAsync(() => {
      mockActivatedRoute.snapshot.params = { slug: 'fail-slug' };
      propertiesServiceSpy.getProperty.and.returnValue(throwError(() => new Error('error')));

      fixture = TestBed.createComponent(ListingFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      tick();

      expect(propertiesServiceSpy.getProperty).toHaveBeenCalledWith('fail-slug');
      expect(toastrSpy.error).toHaveBeenCalledWith('Failed to load property data.');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-listings']);
    }));
  });

  describe('Helper methods and properties (visibleAmenities, toggle, onCoords, photos)', () => {
    it('should filter visibleAmenities correctly when isLand is true vs false', () => {
      component.amenities = [
        { id: 1, name: 'Land Amenity', icon: 'test', group: 'L' },
        { id: 2, name: 'Utility Amenity', icon: 'test', group: 'U' },
        { id: 3, name: 'Security Amenity', icon: 'test', group: 'S' },
        { id: 4, name: 'General Amenity', icon: 'test', group: 'G' }
      ];

      component.form.patchValue({ property_type: 'H' });
      expect(component.isLand).toBeFalse();
      const nonLandAmenities = component.visibleAmenities;
      expect(nonLandAmenities.length).toBe(3);
      expect(nonLandAmenities.some(a => a.group === 'L')).toBeFalse();

      component.form.patchValue({ property_type: 'L' });
      expect(component.isLand).toBeTrue();
      const landAmenities = component.visibleAmenities;
      expect(landAmenities.length).toBe(3);
      expect(landAmenities.some(a => a.group === 'G')).toBeFalse();
    });

    it('should add and delete items from a set when toggle is called', () => {
      const mySet = new Set<number>();
      component.toggle(mySet, 100);
      expect(mySet.has(100)).toBeTrue();
      component.toggle(mySet, 100);
      expect(mySet.has(100)).toBeFalse();
    });

    it('should update lat and lon form values rounded to 6 decimals when onCoords is called', () => {
      component.onCoords({ lat: 6.5243798, lon: 3.3792054 });
      expect(component.form.get('lat')?.value).toBe(6.52438);
      expect(component.form.get('lon')?.value).toBe(3.379205);
    });

    it('should reject photo if file size exceeds 500KB in onPhotosSelected', () => {
      const largeFile = { name: 'huge.jpg', size: 600000 } as File;
      const event = { target: { files: [largeFile], value: 'somepath' } };

      component.onPhotosSelected(event);

      expect(toastrSpy.error).toHaveBeenCalledWith('The photo "huge.jpg" exceeds the 500KB limit.');
      expect(component.photos.length).toBe(0);
      expect(event.target.value).toBe('');
    });

    it('should warn when total photos exceed maxPhotos in onPhotosSelected', () => {
      component.maxPhotos = 2;
      component.photos = [
        { name: 'p1.jpg', size: 100 } as File,
        { name: 'p2.jpg', size: 100 } as File
      ];

      const newFile = { name: 'p3.jpg', size: 100 } as File;
      const event = { target: { files: [newFile], value: 'somepath' } };

      component.onPhotosSelected(event);

      expect(toastrSpy.warning).toHaveBeenCalledWith('You can upload a maximum of 2 photos.');
      expect(component.photos.length).toBe(2);
      expect(event.target.value).toBe('');
    });

    it('should add photo and read data URL when user selects valid photos in onPhotosSelected', () => {
      const validFile = new File(['test image data'], 'valid.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [validFile], value: 'somepath' } };

      const dummyReader = {
        readAsDataURL: jasmine.createSpy('readAsDataURL').and.callFake(function(this: any) {
          this.result = 'data:image/jpeg;base64,mockdata';
          if (this.onload) {
            this.onload();
          }
        }),
        result: '',
        onload: null as any
      };
      spyOn(window as any, 'FileReader').and.returnValue(dummyReader);

      component.onPhotosSelected(event);

      expect(component.photos.length).toBe(1);
      expect(component.photos[0].name).toBe('valid.jpg');
      expect(component.photoPreviews.length).toBe(1);
      expect(component.photoPreviews[0]).toBe('data:image/jpeg;base64,mockdata');
      expect(event.target.value).toBe('');
    });

    it('should remove photo and preview and reset mainPhotoIndex if out of bounds when removePhoto is called', () => {
      component.photos = [{ name: '1.jpg' } as File, { name: '2.jpg' } as File];
      component.photoPreviews = ['preview1', 'preview2'];
      component.mainPhotoIndex = 1;

      component.removePhoto(1);
      expect(component.photos.length).toBe(1);
      expect(component.photoPreviews).toEqual(['preview1']);
      expect(component.mainPhotoIndex).toBe(0);
    });

    it('should do nothing in removeExistingOtherPhoto if editSlug is not set', () => {
      component.editSlug = '';
      component.existingOtherPhotos = ['photo1.jpg'];
      component.removeExistingOtherPhoto(0);
      expect(propertiesServiceSpy.deletePropertyResource).not.toHaveBeenCalled();
      expect(component.existingOtherPhotos.length).toBe(1);
    });

    it('should remove photo and show success toast when removeExistingOtherPhoto succeeds', fakeAsync(() => {
      component.editSlug = 'test-slug';
      component.existingOtherPhotos = ['photo1.jpg', 'photo2.jpg'];
      propertiesServiceSpy.deletePropertyResource.and.returnValue(of({}));

      component.removeExistingOtherPhoto(0);
      tick();

      expect(propertiesServiceSpy.deletePropertyResource).toHaveBeenCalledWith('test-slug', { image_others: ['photo1.jpg'] });
      expect(component.existingOtherPhotos).toEqual(['photo2.jpg']);
      expect(toastrSpy.success).toHaveBeenCalledWith('Photo removed successfully.');
    }));

    it('should show error toast when removeExistingOtherPhoto fails', fakeAsync(() => {
      component.editSlug = 'test-slug';
      component.existingOtherPhotos = ['photo1.jpg'];
      propertiesServiceSpy.deletePropertyResource.and.returnValue(throwError(() => new Error('err')));

      component.removeExistingOtherPhoto(0);
      tick();

      expect(propertiesServiceSpy.deletePropertyResource).toHaveBeenCalledWith('test-slug', { image_others: ['photo1.jpg'] });
      expect(component.existingOtherPhotos).toEqual(['photo1.jpg']);
      expect(toastrSpy.error).toHaveBeenCalledWith('Failed to remove photo.');
    }));
  });


  describe('Submission (Draft and Publish)', () => {
    beforeEach(() => {
      // Fill the form with valid data
      component.form.patchValue({
        title: 'Valid Title',
        listing_type: 'S',
        property_type: 'H',
        price: 100000,
        description: 'This description is definitely at least 30 characters long.',
        city: 'City',
        state: 'State',
        street: 'Street',
        lat: 0,
        lon: 0,
        lot_size: 500
      });
      // Simulate photo selection
      const blob = new Blob([''], { type: 'image/jpeg' });
      const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
      component.photos = [file];
    });

    it('should submit as draft with is_published false', fakeAsync(() => {
      propertiesServiceSpy.createProperty.and.returnValue(of({}));
      
      component.submit('draft');
      tick();

      expect(propertiesServiceSpy.createProperty).toHaveBeenCalled();
      const payload: FormData = propertiesServiceSpy.createProperty.calls.mostRecent().args[0];
      expect(payload.get('is_published')).toBe('false');
      expect(toastrSpy.success).toHaveBeenCalledWith('Your listing has been created!');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/my-listings']);
    }));

    it('should submit as publish with is_published true', fakeAsync(() => {
      propertiesServiceSpy.createProperty.and.returnValue(of({}));
      
      component.submit('publish');
      tick();

      expect(propertiesServiceSpy.createProperty).toHaveBeenCalled();
      const payload: FormData = propertiesServiceSpy.createProperty.calls.mostRecent().args[0];
      expect(payload.get('is_published')).toBe('true');
    }));

    it('should call updateProperty if editSlug is set', fakeAsync(() => {
      component.editSlug = 'edit-slug';
      propertiesServiceSpy.updateProperty.and.returnValue(of({}));
      
      component.submit('publish');
      tick();

      expect(propertiesServiceSpy.updateProperty).toHaveBeenCalled();
      const slug = propertiesServiceSpy.updateProperty.calls.mostRecent().args[0];
      const payload: FormData = propertiesServiceSpy.updateProperty.calls.mostRecent().args[1];
      
      expect(slug).toBe('edit-slug');
      expect(payload.get('is_published')).toBe('true');
      expect(toastrSpy.success).toHaveBeenCalledWith('Listing updated successfully!');
    }));

    it('should mark all fields as touched, show error toast, and scroll to invalid control when submit is called with an invalid form', () => {
      component.form.patchValue({ title: '' });
      const scrollIntoViewSpy = jasmine.createSpy('scrollIntoView');
      const dummyElement = { scrollIntoView: scrollIntoViewSpy } as any as HTMLElement;
      spyOn(document, 'querySelector').and.returnValue(dummyElement);

      component.submit('draft');

      expect(component.form.touched).toBeTrue();
      expect(toastrSpy.error).toHaveBeenCalledWith('Please complete all the required fields.');
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
      expect(propertiesServiceSpy.createProperty).not.toHaveBeenCalled();
    });

    it('should show error toast and scroll to photo area when submit is called with valid form but totalPhotosCount is 0', () => {
      component.photos = [];
      component.existingMainPhoto = null;
      component.existingOtherPhotos = [];
      expect(component.totalPhotosCount).toBe(0);

      const scrollIntoViewSpy = jasmine.createSpy('scrollIntoView');
      const dummyElement = { scrollIntoView: scrollIntoViewSpy } as any as HTMLElement;
      spyOn(document, 'querySelector').and.returnValue(dummyElement);

      component.submit('draft');

      expect(toastrSpy.error).toHaveBeenCalledWith('Please add at least one photo of the property.');
      expect(scrollIntoViewSpy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
      expect(propertiesServiceSpy.createProperty).not.toHaveBeenCalled();
    });

    it('should include rent_period in payload when listing_type is R and rent_period is chosen on submit', fakeAsync(() => {
      component.form.patchValue({
        listing_type: 'R',
        rent_period: 'Y'
      });
      propertiesServiceSpy.createProperty.and.returnValue(of({}));

      component.submit('publish');
      tick();

      expect(propertiesServiceSpy.createProperty).toHaveBeenCalled();
      const payload: FormData = propertiesServiceSpy.createProperty.calls.mostRecent().args[0];
      expect(payload.get('rent_period')).toBe('Y');
    }));

    it('should omit rent_period from payload when rent_period is not set on submit', fakeAsync(() => {
      component.form.patchValue({
        listing_type: 'S',
        rent_period: null
      });
      propertiesServiceSpy.createProperty.and.returnValue(of({}));

      component.submit('publish');
      tick();

      expect(propertiesServiceSpy.createProperty).toHaveBeenCalled();
      const payload: FormData = propertiesServiceSpy.createProperty.calls.mostRecent().args[0];
      expect(payload.has('rent_period')).toBeFalse();
    }));

    it('should handle error with array error message on requestObservable subscription during submit', fakeAsync(() => {
      const errorResp = { error: { errors: { title: ['Title is already taken.'] } } };
      propertiesServiceSpy.createProperty.and.returnValue(throwError(() => errorResp));

      component.submit('publish');
      tick();

      expect(component.submitting).toBeFalse();
      expect(toastrSpy.error).toHaveBeenCalledWith('Title is already taken.');
    }));

    it('should handle error with fallback string message on requestObservable subscription during submit', fakeAsync(() => {
      propertiesServiceSpy.createProperty.and.returnValue(throwError(() => ({ error: { message: 'Simple server error' } })));

      component.submit('publish');
      tick();

      expect(component.submitting).toBeFalse();
      expect(toastrSpy.error).toHaveBeenCalledWith('Simple server error');
    }));

    it('should handle error with empty error object on requestObservable subscription during submit', fakeAsync(() => {
      propertiesServiceSpy.createProperty.and.returnValue(throwError(() => ({})));

      component.submit('publish');
      tick();

      expect(component.submitting).toBeFalse();
      expect(toastrSpy.error).toHaveBeenCalledWith('Something went wrong. Please try again.');
    }));
  });

  describe('Rent Period', () => {
    it('should display rent period select when listing_type is R and validate it', () => {
      let selectEl = fixture.nativeElement.querySelector('select[formControlName="rent_period"]');
      expect(selectEl).toBeNull();
      expect(component.isRent).toBeFalse();

      component.form.patchValue({ listing_type: 'R' });
      fixture.detectChanges();
      expect(component.isRent).toBeTrue();

      selectEl = fixture.nativeElement.querySelector('select[formControlName="rent_period"]');
      expect(selectEl).toBeTruthy();

      const options = selectEl.querySelectorAll('option');
      expect(options.length).toBe(component.rentPeriods.length + 1);

      const rentPeriodCtrl = component.form.get('rent_period');
      expect(rentPeriodCtrl?.valid).toBeFalse();
      rentPeriodCtrl?.markAsTouched();
      fixture.detectChanges();

      expect(selectEl.classList.contains('is-invalid')).toBeTrue();
      const feedbackEl = fixture.nativeElement.querySelector('select[formControlName="rent_period"] ~ .invalid-feedback');
      expect(feedbackEl.textContent).toContain('Rent period is required.');

      rentPeriodCtrl?.setValue('M');
      fixture.detectChanges();
      expect(rentPeriodCtrl?.valid).toBeTrue();
      expect(selectEl.classList.contains('is-invalid')).toBeFalse();

      component.form.patchValue({ listing_type: 'S' });
      fixture.detectChanges();
      expect(component.isRent).toBeFalse();
      selectEl = fixture.nativeElement.querySelector('select[formControlName="rent_period"]');
      expect(selectEl).toBeNull();
      expect(rentPeriodCtrl?.value).toBeNull();
      expect(rentPeriodCtrl?.errors).toBeNull();
    });
  });
});

