import { ReviewsComponent } from 'src/app/components/property-details/reviews/reviews.component';
import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PropertyDetailsComponent } from 'src/app/components/property-details/property-details.component';
import { PropertyDetailComponent } from 'src/app/components/property-details/property-detail/property-detail.component';
import { PropertyDescriptionComponent } from 'src/app/components/property-details/property-description/property-description.component';
import { ClientAdminComponent } from 'src/app/components/property-details/client-admin/client-admin.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PropertyDetailService } from 'src/app/services/property-detail/property-detail.service';
import {
    resetSpies, propertyDetailSpy, toastServiceSpy
} from 'src/app/helpers/tests/spies';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { AuthService } from 'src/app/services/auth.service';
import { ProfileService } from 'src/app/services/profile/profile.service';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('Property detail', () => {
    let component: PropertyDetailsComponent;
    let fixture: ComponentFixture<PropertyDetailsComponent>;
    let chatServiceSpy: jasmine.SpyObj<ChatService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let profileServiceSpy: jasmine.SpyObj<ProfileService>;
    let propertiesServiceSpy: jasmine.SpyObj<PropertiesService>;
    let router: Router;

    const responseObject = {
        data: {
            property: {
                id: 5,
                price: 30000000.0,
                lot_size: 30.99,
                image_others: ['img1.jpg'],
                address: { City: 'Kampala', State: 'Kireka', Street: 'Profla' },
                coordinates: { lat: 0.3476, lon: 32.5825 },
                created_at: '2019-08-02T12:04:38Z',
                title: '2 Bedroomed Flat',
                property_type: 'House',
                listing_type: 'Rent',
                rent_period: 'Monthly',
                status: 'Available',
                description: 'Lorem ipsum dolor sit amet',
                bedrooms: 2,
                bathrooms: 1,
                garages: 1,
                image_main: 'main.jpg',
                distance_to_main_road: '100m',
                distance_to_city: '2km',
                noise_level: 'Quiet',
                amenities: [
                  { name: 'Pool', icon: 'fa-swimmer', group_display: 'Leisure' }
                ],
                nearby: [
                  { name: 'Hospital', icon: 'fa-hospital' }
                ],
                owner: { id: 99, first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
                slug: 'profla-kireka-flats'
            }
        }
    };

    const mockActivateRouteParam = {
        paramMap: of({ get: () => 'profla-kireka-flats' })
    };

    beforeAll(() => resetSpies([propertyDetailSpy]));
    afterEach(() => resetSpies([propertyDetailSpy]));

    beforeEach(waitForAsync(() => {
        chatServiceSpy = jasmine.createSpyObj('ChatService', ['startConversation']);
        authServiceSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
        profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getProfile']);
        propertiesServiceSpy = jasmine.createSpyObj('PropertiesService', ['getSavedProperties', 'toggleSavedProperty']);

        authServiceSpy.isLoggedIn.and.returnValue(true);
        profileServiceSpy.getProfile.and.returnValue(of({ data: { profile: { user: { id: 100 } } } } as any));
        propertiesServiceSpy.getSavedProperties.and.returnValue(of({ data: { property: [{ slug: 'profla-kireka-flats' }] } }));

        TestBed.configureTestingModule({
            declarations: [
                PropertyDetailsComponent,
                PropertyDetailComponent,
                PropertyDescriptionComponent,
                ClientAdminComponent,
                ReviewsComponent
            ],
            imports: [
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([{ path: '**', component: PropertyDetailsComponent }]),
                NgxSpinnerModule
            ],
            providers: [
                LocalStorageService,
                { provide: PropertyDetailService, useValue: propertyDetailSpy },
                { provide: ActivatedRoute, useValue: mockActivateRouteParam },
                { provide: ToastrService, useValue: toastServiceSpy },
                { provide: ChatService, useValue: chatServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: ProfileService, useValue: profileServiceSpy },
                { provide: PropertiesService, useValue: propertiesServiceSpy }
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PropertyDetailsComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        propertyDetailSpy.getProperty.and.returnValue(of(responseObject));
        fixture.detectChanges();
    });

    it('should create and populate property details on init', () => {
      expect(component).toBeTruthy();
      expect(component.rentPeriod).toBe('Monthly');
      expect(component.distanceToMainRoad).toBe('100m');
      expect(component.distanceToCity).toBe('2km');
      expect(component.noiseLevel).toBe('Quiet');
      expect(component.lat).toBe(0.3476);
      expect(component.lon).toBe(32.5825);
    });

    it('should render rentPeriod tag in HTML', () => {
      const tags = fixture.debugElement.queryAll(By.css('.tag'));
      const rentTag = tags.find(t => t.nativeElement.textContent.includes('Monthly'));
      expect(rentTag).toBeTruthy();
    });

    it('should render location quality and surroundings section', () => {
      const infoCards = fixture.debugElement.queryAll(By.css('.info-card'));
      expect(infoCards.length).toBeGreaterThan(0);

      const qualityBox = fixture.debugElement.query(By.css('.quality strong'));
      expect(qualityBox).toBeTruthy();
      expect(qualityBox.nativeElement.textContent).toContain('100m');
    });

    it('should render amenities and amenity groups', () => {
      const groups = component.amenityGroups;
      expect(groups.length).toBe(1);
      expect(groups[0].name).toBe('Leisure');

      const chip = fixture.debugElement.query(By.css('.chip'));
      expect(chip).toBeTruthy();
      expect(chip.nativeElement.textContent).toContain('Hospital');
    });

    it('should render map when lat and lon are present', () => {
      const mapEl = fixture.debugElement.query(By.css('app-map'));
      expect(mapEl).toBeTruthy();
    });

    it('should render owner profile link and allow navigating to owner listings', () => {
      const ownerLink = fixture.debugElement.query(By.css('.owner-listings-link'));
      expect(ownerLink).toBeTruthy();
      expect(ownerLink.nativeElement.getAttribute('href')).toContain('/user/99');
    });

    it('should start conversation and navigate to messages when chatWithOwner is called', fakeAsync(() => {
      chatServiceSpy.startConversation.and.returnValue(of({ data: { conversation: { id: 777 } } }));
      component.chatWithOwner();
      tick();

      expect(chatServiceSpy.startConversation).toHaveBeenCalledWith('profla-kireka-flats');
      expect(router.navigate).toHaveBeenCalledWith(['/messages', 777]);
    }));

    it('should render "This is your listing" button when owner.id equals myId', () => {
      component.owner = { id: 99, first_name: 'John', last_name: 'Doe' };
      component.myId = 99;
      (component as any).cdr.detectChanges();
      fixture.detectChanges();

      const btn = fixture.debugElement.query(By.css('.btn-secondary'));
      expect(btn).toBeTruthy();
      expect(btn.nativeElement.textContent).toContain('This is your listing');
    });

    describe('checkIfSaved, toggleSave, chatWithOwner, and error flows', () => {
      it('should check if property is saved on init and set saved to true when matching', () => {
        expect(propertiesServiceSpy.getSavedProperties).toHaveBeenCalled();
        expect(component.saved).toBeTrue();
      });

      it('should set saved to true when checkIfSaved finds matching slug', () => {
        component.slug = 'matching-slug';
        component.savedPropertiesList = [{ slug: 'matching-slug' }];
        component.saved = false;
        component.checkIfSaved();
        expect(component.saved).toBeTrue();
      });

      it('should leave saved as false when checkIfSaved finds no matching slug', () => {
        component.slug = 'profla-kireka-flats';
        component.savedPropertiesList = [{ slug: 'other-slug' }];
        component.saved = false;
        component.checkIfSaved();
        expect(component.saved).toBeFalse();
      });

      it('should parse savedPropertiesList from savedProps.results or direct Array on init', () => {
        authServiceSpy.isLoggedIn.and.returnValue(true);
        propertiesServiceSpy.getSavedProperties.and.returnValue(of({ results: [{ slug: 'profla-kireka-flats' }] }));
        component.ngOnInit();
        expect(component.savedPropertiesList.length).toBe(1);

        propertiesServiceSpy.getSavedProperties.and.returnValue(of([{ slug: 'profla-kireka-flats' }] as any));
        component.ngOnInit();
        expect(component.savedPropertiesList.length).toBe(1);
      });

      it('should redirect to login when toggleSave is called and user is not logged in', () => {
        authServiceSpy.isLoggedIn.and.returnValue(false);
        component.toggleSave();
        expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { next: '/properties/profla-kireka-flats' } });
      });

      it('should toggle saved property and show success toast when logged in', () => {
        authServiceSpy.isLoggedIn.and.returnValue(true);
        propertiesServiceSpy.toggleSavedProperty.and.returnValue(of({ data: 'Saved list updated' }));
        component.saved = false;
        component.toggleSave();
        expect(component.saved).toBeTrue();
        expect(propertiesServiceSpy.toggleSavedProperty).toHaveBeenCalledWith('profla-kireka-flats', true);
        expect(toastServiceSpy.success).toHaveBeenCalledWith('Saved list updated');
      });

      it('should revert saved state and show error toast when toggleSavedProperty fails', () => {
        authServiceSpy.isLoggedIn.and.returnValue(true);
        propertiesServiceSpy.toggleSavedProperty.and.returnValue(throwError(() => ({ message: 'Could not update your saved list' })));
        component.saved = false;
        component.toggleSave();
        expect(component.saved).toBeFalse();
        expect(toastServiceSpy.error).toHaveBeenCalledWith('Could not update your saved list');
      });

      it('should redirect to login when chatWithOwner is called and user is not logged in', () => {
        authServiceSpy.isLoggedIn.and.returnValue(false);
        component.chatWithOwner();
        expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { next: '/properties/profla-kireka-flats' } });
      });

      it('should handle error when startConversation fails in chatWithOwner', fakeAsync(() => {
        authServiceSpy.isLoggedIn.and.returnValue(true);
        chatServiceSpy.startConversation.and.returnValue(throwError(() => ({ message: 'Could not start the conversation' })));
        component.startingChat = false;
        component.chatWithOwner();
        tick();
        expect(component.startingChat).toBeFalse();
        expect(toastServiceSpy.error).toHaveBeenCalledWith('Could not start the conversation');
      }));

      it('should handle error during viewProperty when getProperty fails', fakeAsync(() => {
        propertyDetailSpy.getProperty.and.returnValue(throwError(() => new Error('Property not found')));
        component.viewProperty('invalid-slug');
        tick();
        expect(toastServiceSpy.error).toHaveBeenCalledWith('Property not found');
        expect(router.navigate).toHaveBeenCalledWith(['/properties']);
      }));
    });
});
