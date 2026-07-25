import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MyListingsComponent } from './my-listings.component';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

describe('MyListingsComponent', () => {
  let component: MyListingsComponent;
  let fixture: ComponentFixture<MyListingsComponent>;
  let propertiesServiceSpy: jasmine.SpyObj<PropertiesService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  const mockProfile = {
    data: {
      profile: { user: { email: 'test@example.com' } }
    }
  };

  const mockProperties = [
    { slug: 'prop-1', title: 'Property 1', is_published: true, owner: { email: 'test@example.com' } },
    { slug: 'prop-2', title: 'Property 2', is_published: false, owner: { email: 'test@example.com' } },
    { slug: 'prop-3', title: 'Property 3', is_published: true, owner: { email: 'other@example.com' } }
  ];

  beforeEach(async () => {
    propertiesServiceSpy = jasmine.createSpyObj('PropertiesService', [
      'searchProperties',
      'updateStatus',
      'updateProperty',
      'deleteProperty'
    ]);
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getProfile']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    profileServiceSpy.getProfile.and.returnValue(of(mockProfile as any));
    propertiesServiceSpy.searchProperties.and.returnValue(of({ results: mockProperties }));

    await TestBed.configureTestingModule({
      declarations: [ MyListingsComponent ],
      imports: [ RouterTestingModule ],
      providers: [
        { provide: PropertiesService, useValue: propertiesServiceSpy },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MyListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user email and filter properties on init', fakeAsync(() => {
    tick();
    expect(profileServiceSpy.getProfile).toHaveBeenCalled();
    expect(propertiesServiceSpy.searchProperties).toHaveBeenCalled();
    // Only 2 properties belong to 'test@example.com'
    expect(component.listings.length).toBe(2);
    expect(component.myEmail).toBe('test@example.com');
  }));

  it('should mark listing status', fakeAsync(() => {
    propertiesServiceSpy.updateStatus.and.returnValue(of({}));
    const listing = mockProperties[0];
    
    component.markAs(listing, 'sold');
    tick();

    expect(propertiesServiceSpy.updateStatus).toHaveBeenCalledWith('prop-1', 'sold');
    expect(toastrSpy.success).toHaveBeenCalledWith('Listing status updated');
    expect(propertiesServiceSpy.searchProperties).toHaveBeenCalledTimes(2); // once on init, once after update
  }));

  it('should publish a draft listing', fakeAsync(() => {
    propertiesServiceSpy.updateProperty.and.returnValue(of({}));
    const listing = mockProperties[1]; // draft listing
    
    component.publish(listing);
    tick();

    expect(propertiesServiceSpy.updateProperty).toHaveBeenCalled();
    const slug = propertiesServiceSpy.updateProperty.calls.mostRecent().args[0];
    const payload: FormData = propertiesServiceSpy.updateProperty.calls.mostRecent().args[1];
    
    expect(slug).toBe('prop-2');
    expect(payload.get('is_published')).toBe('true');
    expect(toastrSpy.success).toHaveBeenCalledWith('Listing published successfully!');
    expect(propertiesServiceSpy.searchProperties).toHaveBeenCalledTimes(2);
  }));

  it('should handle error when publishing fails', fakeAsync(() => {
    propertiesServiceSpy.updateProperty.and.returnValue(throwError(() => new Error('Error')));
    const listing = mockProperties[1];
    
    component.publish(listing);
    tick();

    expect(toastrSpy.error).toHaveBeenCalledWith('Could not publish the listing');
  }));

  describe('Template rendering and action button interactions', () => {
    it('should display loading spinner when loading is true', () => {
      component.loading = true;
      (component as any).cdr.detectChanges();
      fixture.detectChanges();
      const spinner = fixture.nativeElement.querySelector('.fa-spinner');
      expect(spinner).toBeTruthy();
    });

    it('should display empty state container when not loading and listings is empty', () => {
      component.loading = false;
      component.listings = [];
      (component as any).cdr.detectChanges();
      fixture.detectChanges();
      const emptyState = fixture.nativeElement.querySelector('.empty-state');
      expect(emptyState).toBeTruthy();
      expect(emptyState.textContent).toContain('No listings yet');
    });

    it('should render and trigger action buttons on listing cards in DOM', fakeAsync(() => {
      component.loading = false;
      component.listings = [
        { slug: 'prop-draft', title: 'Draft Prop', is_published: false, owner: { email: 'test@example.com' } },
        { slug: 'prop-rent', title: 'Rent Prop', is_published: true, status: 'Available', listing_type: 'Rent', owner: { email: 'test@example.com' } },
        { slug: 'prop-sale', title: 'Sale Prop', is_published: true, status: 'Available', listing_type: 'Sale', owner: { email: 'test@example.com' } },
        { slug: 'prop-sold', title: 'Sold Prop', is_published: true, status: 'Sold', owner: { email: 'test@example.com' } }
      ];
      (component as any).cdr.detectChanges();
      fixture.detectChanges();

      spyOn(component, 'publish');
      spyOn(component, 'markAs');
      spyOn(component, 'remove');

      const cards = fixture.nativeElement.querySelectorAll('.listing-card');
      expect(cards.length).toBe(4);

      // Card 0: Draft -> has Publish and Delete buttons
      const publishBtn = cards[0].querySelector('.btn-outline-success');
      expect(publishBtn.textContent.trim()).toBe('Publish');
      publishBtn.click();
      expect(component.publish).toHaveBeenCalledWith(component.listings[0]);

      // Card 1: Available Rent -> has Mark rented and Delete buttons
      const rentBtn = cards[1].querySelector('.btn-outline-primary');
      expect(rentBtn.textContent.trim()).toBe('Mark rented');
      rentBtn.click();
      expect(component.markAs).toHaveBeenCalledWith(component.listings[1], 'RE');

      // Card 2: Available Sale -> has Mark sold and Delete buttons
      const saleBtn = cards[2].querySelector('.btn-outline-primary');
      expect(saleBtn.textContent.trim()).toBe('Mark sold');
      saleBtn.click();
      expect(component.markAs).toHaveBeenCalledWith(component.listings[2], 'SO');

      // Card 3: Sold -> has Relist button
      const relistBtn = cards[3].querySelector('.btn-outline-success');
      expect(relistBtn.textContent.trim()).toBe('Relist');
      relistBtn.click();
      expect(component.markAs).toHaveBeenCalledWith(component.listings[3], 'AV');

      // Test delete button click on card 0
      const deleteBtn = cards[0].querySelector('.btn-outline-danger');
      deleteBtn.click();
      expect(component.remove).toHaveBeenCalledWith(component.listings[0]);
    }));
  });

  describe('Error handling and removal logic', () => {
    it('should call fetch on init even if getProfile returns error', fakeAsync(() => {
      profileServiceSpy.getProfile.and.returnValue(throwError(() => new Error('profile err')));
      spyOn(component, 'fetch');
      component.ngOnInit();
      tick();
      expect(component.fetch).toHaveBeenCalled();
    }));

    it('should set loading to false on fetch error', fakeAsync(() => {
      propertiesServiceSpy.searchProperties.and.returnValue(throwError(() => new Error('fetch err')));
      component.loading = true;
      component.fetch();
      tick();
      expect(component.loading).toBeFalse();
    }));

    it('should handle error when markAs fails with structured error or generic error', fakeAsync(() => {
      propertiesServiceSpy.updateStatus.and.returnValue(throwError(() => ({ error: { errors: { status: ['Invalid status'] } } })));
      component.markAs({ slug: 'prop-1' }, 'sold');
      tick();
      expect(toastrSpy.error).toHaveBeenCalledWith('Invalid status');

      propertiesServiceSpy.updateStatus.and.returnValue(throwError(() => new Error('err')));
      component.markAs({ slug: 'prop-1' }, 'sold');
      tick();
      expect(toastrSpy.error).toHaveBeenCalledWith('Could not update status');
    }));

    it('should delete property when confirmed in remove()', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      propertiesServiceSpy.deleteProperty.and.returnValue(of({}));
      const listing = { slug: 'prop-del', title: 'Delete Prop' };

      component.remove(listing);
      tick();

      expect(propertiesServiceSpy.deleteProperty).toHaveBeenCalledWith('prop-del');
      expect(toastrSpy.success).toHaveBeenCalledWith('Listing deleted');
      expect(propertiesServiceSpy.searchProperties).toHaveBeenCalled();
    }));

    it('should not delete property when confirm is cancelled in remove()', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      const listing = { slug: 'prop-del', title: 'Delete Prop' };

      component.remove(listing);

      expect(propertiesServiceSpy.deleteProperty).not.toHaveBeenCalled();
    });

    it('should show error toast when remove() fails', fakeAsync(() => {
      spyOn(window, 'confirm').and.returnValue(true);
      propertiesServiceSpy.deleteProperty.and.returnValue(throwError(() => new Error('delete err')));
      const listing = { slug: 'prop-del', title: 'Delete Prop' };

      component.remove(listing);
      tick();

      expect(toastrSpy.error).toHaveBeenCalledWith('Could not delete the listing');
    }));
  });
});
