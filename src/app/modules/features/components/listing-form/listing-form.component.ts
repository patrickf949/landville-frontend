import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PropertiesService } from 'src/app/services/properties/properties.service';

interface CatalogueItem { id: number; name: string; icon: string; group?: string; group_display?: string; }

@Component({
  selector: 'app-listing-form',
  standalone: false,
  templateUrl: './listing-form.component.html',
  styleUrls: ['./listing-form.component.scss']
})
export class ListingFormComponent implements OnInit {
  form: FormGroup;
  amenities: CatalogueItem[] = [];
  nearbyFeatures: CatalogueItem[] = [];
  selectedAmenities = new Set<number>();
  selectedNearby = new Set<number>();
  photos: File[] = [];
  photoPreviews: string[] = [];
  mainPhotoIndex = 0;
  submitting = false;
  maxPhotos = 5;

  listingTypes = [
    { value: 'S', label: 'For Sale' },
    { value: 'R', label: 'For Rent' },
  ];
  propertyTypes = [
    { value: 'H', label: 'House' },
    { value: 'A', label: 'Apartment' },
    { value: 'L', label: 'Land' },
    { value: 'C', label: 'Commercial' },
    { value: 'R', label: 'Room / Shared' },
  ];
  rentPeriods = [
    { value: 'M', label: 'Monthly' },
    { value: 'Y', label: 'Yearly' },
  ];
  roadDistances = [
    { value: '1', label: 'Less than 500 m' },
    { value: '2', label: '500 m – 2 km' },
    { value: '3', label: '2 – 5 km' },
    { value: '4', label: 'More than 5 km' },
  ];
  cityDistances = [
    { value: '1', label: 'Less than 5 km' },
    { value: '2', label: '5 – 20 km' },
    { value: '3', label: '20 – 50 km' },
    { value: '4', label: 'More than 50 km' },
  ];
  noiseLevels = [
    { value: 'Q', label: 'Quiet' },
    { value: 'M', label: 'Moderate' },
    { value: 'B', label: 'Busy' },
  ];

  constructor(
    private fb: FormBuilder,
    private propertiesService: PropertiesService,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(255)]],
      listing_type: ['S', Validators.required],
      property_type: ['H', Validators.required],
      rent_period: [null],
      price: [null, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(30)]],
      city: ['', Validators.required],
      state: ['', Validators.required],
      street: ['', Validators.required],
      lat: [null, Validators.required],
      lon: [null, Validators.required],
      bedrooms: [null],
      bathrooms: [null],
      garages: [null],
      lot_size: [null, Validators.required],
      distance_to_main_road: [null],
      distance_to_city: [null],
      noise_level: [null],
    });
  }

  ngOnInit(): void {
    this.propertiesService.getAmenities().subscribe(
      (data: any) => {
        this.amenities = data || [];
        this.cdr.detectChanges();
      });
    this.propertiesService.getNearbyFeatures().subscribe(
      (data: any) => {
        this.nearbyFeatures = data || [];
        this.cdr.detectChanges();
      });
    this.form.get('listing_type').valueChanges.subscribe(value => {
      const rentPeriod = this.form.get('rent_period');
      if (value === 'R') {
        rentPeriod.setValidators([Validators.required]);
      } else {
        rentPeriod.clearValidators();
        rentPeriod.setValue(null);
      }
      rentPeriod.updateValueAndValidity();
      this.cdr.detectChanges();
    });
  }

  get isLand(): boolean {
    return this.form.get('property_type').value === 'L';
  }

  get isRent(): boolean {
    return this.form.get('listing_type').value === 'R';
  }

  get visibleAmenities(): CatalogueItem[] {
    if (this.isLand) {
      return this.amenities.filter(a => ['L', 'U', 'S'].includes(a.group));
    }
    return this.amenities.filter(a => a.group !== 'L');
  }

  toggle(set: Set<number>, id: number): void {
    set.has(id) ? set.delete(id) : set.add(id);
  }

  onCoords(coords: { lat: number; lon: number }): void {
    this.form.patchValue({
      lat: +coords.lat.toFixed(6),
      lon: +coords.lon.toFixed(6)
    });
  }

  onPhotosSelected(event: any): void {
    const files: File[] = Array.from(event.target.files || []);
    for (const file of files) {
      if (file.size > 500 * 1024) {
        this.toastr.error(`The photo "${file.name}" exceeds the 500KB limit.`);
        continue;
      }
      if (this.photos.length >= this.maxPhotos) {
        this.toastr.warning(
          `You can upload a maximum of ${this.maxPhotos} photos.`);
        break;
      }
      this.photos.push(file);
      const reader = new FileReader();
      reader.onload = () => {
        this.photoPreviews.push(reader.result as string);
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
    this.cdr.detectChanges();
  }

  removePhoto(index: number): void {
    this.photos.splice(index, 1);
    this.photoPreviews.splice(index, 1);
    if (this.mainPhotoIndex >= this.photos.length) {
      this.mainPhotoIndex = 0;
    }
    this.cdr.detectChanges();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Please complete all the required fields.');
      this.cdr.detectChanges();
      
      // Auto-scroll to the first invalid control
      const firstInvalidControl: HTMLElement = document.querySelector('form .ng-invalid');
      if (firstInvalidControl) {
        firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    if (!this.photos.length) {
      this.toastr.error('Please add at least one photo of the property.');
      this.cdr.detectChanges();
      
      // Auto-scroll to the photo upload area
      const photoUploadArea: HTMLElement = document.querySelector('.photo-upload-area');
      if (photoUploadArea) {
        photoUploadArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    const value = this.form.value;
    const payload = new FormData();
    payload.append('title', value.title);
    payload.append('listing_type', value.listing_type);
    payload.append('property_type', value.property_type);
    if (value.rent_period) { payload.append('rent_period', value.rent_period); }
    payload.append('price', String(value.price));
    payload.append('description', value.description);
    payload.append('lot_size', String(value.lot_size));
    payload.append('address', JSON.stringify({
      City: value.city, State: value.state, Street: value.street }));
    payload.append('coordinates', JSON.stringify({
      lat: value.lat, lon: value.lon }));
    if (!this.isLand) {
      ['bedrooms', 'bathrooms', 'garages'].forEach(field => {
        if (value[field] != null) {
          payload.append(field, String(value[field]));
        }
      });
    }
    ['distance_to_main_road', 'distance_to_city', 'noise_level'].forEach(
      field => {
        if (value[field]) { payload.append(field, value[field]); }
      });
    this.selectedAmenities.forEach(
      id => payload.append('amenities', String(id)));
    this.selectedNearby.forEach(id => payload.append('nearby', String(id)));

    const main = this.photos[this.mainPhotoIndex];
    payload.append('image_main', main, main.name);
    this.photos.forEach((photo, i) => {
      if (i !== this.mainPhotoIndex) {
        payload.append('image_others', photo, photo.name);
      }
    });

    this.submitting = true;
    this.propertiesService.createProperty(payload).subscribe({
      next: () => {
        this.toastr.success('Your listing has been created!');
        this.router.navigate(['/my-listings']);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.submitting = false;
        const errors = err?.error?.errors || err?.error || {};
        const first = Object.values(errors)[0];
        this.toastr.error(
          Array.isArray(first) ? String(first[0]) : String(first || 'Something went wrong. Please try again.'));
        this.cdr.detectChanges();
      }
    });
  }
}
