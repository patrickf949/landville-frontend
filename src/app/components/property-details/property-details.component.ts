import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { PropertyDetailService } from 'src/app/services/property-detail/property-detail.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { removeSubscription } from 'src/app/helpers/unsubscribe';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { PropertiesService } from 'src/app/services/properties/properties.service';
import { extractErrorMessage } from 'src/app/helpers/error-handler';
import { ProfileService } from 'src/app/services/profile/profile.service';

@Component({
  standalone: false,
  selector: 'app-property-details',
  templateUrl: './property-details.component.html',
  styleUrls: ['./property-details.component.scss']
})

export class PropertyDetailsComponent implements OnInit, OnDestroy {
  property: any;
  slug: string;
  bedrooms: number;
  bathrooms: number;
  garages: number;
  city: string;
  state: string;
  street: string;
  title: string;
  price: number;
  description: string;
  imageMain: string;
  imageOthers: Array<any> = [];
  lotSize: string;
  video: string;
  ifBuilding: boolean;
  ifVideo: boolean;
  createdAt: string;
  listingType: string;
  propertyType: string;
  rentPeriod: string;
  status: string;
  owner: any = null;
  amenities: any[] = [];
  nearby: any[] = [];
  distanceToMainRoad: string;
  distanceToCity: string;
  noiseLevel: string;
  lat: number | null = null;
  lon: number | null = null;
  saved = false;
  startingChat = false;
  myId: number | null = null;
  subscribe: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyservice: PropertyDetailService,
    private propertiesService: PropertiesService,
    private chatService: ChatService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef
  ) { }

  savedPropertiesList: any[] = [];

  ngOnInit(): void {
    if (this.isLoggedIn) {
      this.subscribe.push(
        this.profileService.getProfile().subscribe((profile: any) => {
          const profileData: any = profile;
          this.myId = profileData?.data?.profile?.user?.id || profileData?.data?.user?.id || profileData?.profile?.user?.id || null;
          this.cdr.detectChanges();
        })
      );
      this.subscribe.push(
        this.propertiesService.getSavedProperties().subscribe((savedProps: any) => {
          this.savedPropertiesList = savedProps?.data?.property || savedProps?.results || (Array.isArray(savedProps) ? savedProps : []);
          this.checkIfSaved();
        })
      );
    }
    this.route.paramMap.subscribe(result => {
      this.slug = result.get('slug');
      this.viewProperty(this.slug);
      this.checkIfSaved();
    });
  }

  checkIfSaved(): void {
    if (this.slug && this.savedPropertiesList.length > 0) {
      if (this.savedPropertiesList.some((p: any) => p.slug === this.slug)) {
        this.saved = true;
        this.cdr.detectChanges();
      }
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  get amenityGroups(): { name: string, items: any[] }[] {
    const groups: { [key: string]: any[] } = {};
    (this.amenities || []).forEach(a => {
      const label = a.group_display || 'Other';
      groups[label] = groups[label] || [];
      groups[label].push(a);
    });
    return Object.keys(groups).map(name => ({ name, items: groups[name] }));
  }

  viewProperty(slug) {
    this.spinner.show();
    this.subscribe.push(
      this.propertyservice.getProperty(slug).subscribe(
        response => {
          const data = response.data ? (response.data.property || response) : response;
          this.description = data.description;
          this.title = data.title;
          this.city = data.address?.City || '';
          this.state = data.address?.State || '';
          this.street = data.address?.Street || '';
          this.price = data.price;
          this.imageMain = data.image_main;
          this.imageOthers = data.image_others || [];
          this.lotSize = data.lot_size;
          this.video = data.video;
          this.property = data;
          this.listingType = data.listing_type;
          this.propertyType = data.property_type;
          this.rentPeriod = data.rent_period;
          this.status = data.status;
          this.owner = data.owner;
          this.amenities = data.amenities || [];
          this.nearby = data.nearby || [];
          this.distanceToMainRoad = data.distance_to_main_road;
          this.distanceToCity = data.distance_to_city;
          this.noiseLevel = data.noise_level;
          const lat = parseFloat(data?.coordinates?.lat);
          const lon = parseFloat(data?.coordinates?.lon);
          this.lat = isNaN(lat) ? null : lat;
          this.lon = isNaN(lon) ? null : lon;
          this.checkIfBuilding(data.property_type, data);
          this.checkIfVideo(this.video);
          this.createdAt = data.created_at;
          this.spinner.hide();
          this.cdr.detectChanges();
        }, error => {
          this.toastrService.error(extractErrorMessage(error));
          this.router.navigate(['/properties']);
          this.spinner.hide();
          this.cdr.detectChanges();
        }
      )
    );
  }

  checkIfBuilding(propertyType, data) {
    if (propertyType !== 'Land') {
      this.ifBuilding = true;
      this.bedrooms = data.bedrooms;
      this.bathrooms = data.bathrooms;
      this.garages = data.garages;
    } else {
      this.ifBuilding = false;
    }
  }

  checkIfVideo(video: string) {
    if (video) {
      this.ifVideo = true;
    }
  }

  chatWithOwner(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { next: `/properties/${this.slug}` } });
      return;
    }
    this.startingChat = true;
    this.chatService.startConversation(this.slug).subscribe({
      next: (response: any) => {
        const conversation = response?.data?.conversation;
        this.router.navigate(['/messages', conversation.id]);
      },
      error: (err) => {
        this.startingChat = false;
        this.toastrService.error(extractErrorMessage(err) || 'Could not start the conversation');
      }
    });
  }

  toggleSave(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login'], {
        queryParams: { next: `/properties/${this.slug}` } });
      return;
    }
    this.saved = !this.saved;
    this.propertiesService.toggleSavedProperty(this.slug, this.saved)
      .subscribe({
        next: (response: any) => this.toastrService.success(
          response?.data || 'Saved list updated'),
        error: (err) => {
          this.saved = !this.saved;
          this.toastrService.error(extractErrorMessage(err) || 'Could not update your saved list');
        }
      });
  }

  ngOnDestroy(): void {
    removeSubscription(this.subscribe);
  }
}
