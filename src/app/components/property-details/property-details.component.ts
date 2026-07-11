import { Component, OnInit, OnDestroy } from '@angular/core';
import { PropertyDetailService } from 'src/app/services/property-detail/property-detail.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { removeSubscription } from 'src/app/helpers/unsubscribe';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';
import { ChatService } from 'src/app/services/chat/chat.service';
import { PropertiesService } from 'src/app/services/properties/properties.service';

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
  price: string;
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
  subscribe: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyservice: PropertyDetailService,
    private propertiesService: PropertiesService,
    private chatService: ChatService,
    private authService: AuthService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(result => {
      this.slug = result.get('slug');
      this.viewProperty(this.slug);
    });
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
          const data = response.data.property;
          const priceHolder = data.price;
          this.description = data.description;
          this.title = data.title;
          this.city = data.address.City;
          this.state = data.address.State;
          this.street = data.address.Street;
          this.price = priceHolder.toString();
          this.imageMain = data.image_main;
          this.imageOthers = data.image_others;
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
        }, error => {
          this.toastrService.error(JSON.stringify(error.errors));
          this.router.navigate(['/properties']);
          this.spinner.hide();
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
        this.toastrService.error(
          err?.error?.errors || 'Could not start the conversation');
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
          this.toastrService.error(
            err?.error?.errors || 'Could not update your saved list');
        }
      });
  }

  ngOnDestroy(): void {
    removeSubscription(this.subscribe);
  }
}
