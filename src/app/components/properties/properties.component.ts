import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  PropertiesService, PropertyFilters
} from 'src/app/services/properties/properties.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Property } from 'src/app/models/Property';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MapMarker } from 'src/app/modules/shared/components/map/map.component';

@Component({
  standalone: false,
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  propertiesUrl = `${environment.api_url}/properties/`;
  next = '';
  previous = '';
  disabledNext = false;
  disabledPrevious = false;
  view: 'grid' | 'list' | 'map' = 'grid';
  count = 0;
  loading = false;

  // filters
  filters: PropertyFilters = {};
  amenities: any[] = [];
  nearbyFeatures: any[] = [];
  selectedAmenities = new Set<number>();
  selectedNearby = new Set<number>();
  showFilters = true;

  listingTypes = [
    { value: '', label: 'Rent & Sale' },
    { value: 'R', label: 'For Rent' },
    { value: 'S', label: 'For Sale' },
  ];
  propertyTypes = [
    { value: '', label: 'Any type' },
    { value: 'H', label: 'House' },
    { value: 'A', label: 'Apartment' },
    { value: 'L', label: 'Land' },
    { value: 'C', label: 'Commercial' },
    { value: 'R', label: 'Room / Shared' },
  ];
  roadDistances = [
    { value: '', label: 'Any distance' },
    { value: '1', label: '< 500 m to main road' },
    { value: '2', label: '500 m – 2 km' },
    { value: '3', label: '2 – 5 km' },
    { value: '4', label: '5 km +' },
  ];
  cityDistances = [
    { value: '', label: 'Any distance' },
    { value: '1', label: '< 5 km to city' },
    { value: '2', label: '5 – 20 km' },
    { value: '3', label: '20 – 50 km' },
    { value: '4', label: '50 km +' },
  ];
  noiseLevels = [
    { value: '', label: 'Any surroundings' },
    { value: 'Q', label: 'Quiet' },
    { value: 'M', label: 'Moderate' },
    { value: 'B', label: 'Busy' },
  ];

  constructor(
    private propertiesServices: PropertiesService,
    private spinner: NgxSpinnerService,
    private toastrService: ToastrService,
    private titleService: Title,
    private metaService: Meta,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      this.titleService.setTitle(data.title);
      this.metaService.addTags(data.tags, true);
    });
    this.propertiesServices.getAmenities().subscribe(
      (data: any) => this.amenities = data || []);
    this.propertiesServices.getNearbyFeatures().subscribe(
      (data: any) => this.nearbyFeatures = data || []);
    this.search();
  }

  setDocTitle(title: string) {
    this.titleService.setTitle(title);
  }

  toggleChip(set: Set<number>, id: number): void {
    set.has(id) ? set.delete(id) : set.add(id);
    this.search();
  }

  search(): void {
    const query: PropertyFilters = { ...this.filters };
    if (this.selectedAmenities.size) {
      query.amenities = Array.from(this.selectedAmenities);
    }
    if (this.selectedNearby.size) {
      query.nearby = Array.from(this.selectedNearby);
    }
    this.loading = true;
    this.spinner.show();
    this.propertiesServices.searchProperties(query).pipe(
      catchError(() => of(null)),
      finalize(() => { this.spinner.hide(); this.loading = false; this.cdr.detectChanges(); })
    ).subscribe(response => {
      this.consume(response);
      this.cdr.detectChanges();
    });
  }

  clearFilters(): void {
    this.filters = {};
    this.selectedAmenities.clear();
    this.selectedNearby.clear();
    this.search();
  }

  setPage(url: string) {
    this.loading = true;
    this.spinner.show();
    this.propertiesServices.getProperties(url).pipe(
      catchError(() => of(null)),
      finalize(() => { this.spinner.hide(); this.loading = false; this.cdr.detectChanges(); })
    ).subscribe(response => {
      this.consume(response);
      this.cdr.detectChanges();
    });
  }

  private consume(response: any): void {
    this.disabledNext = false;
    this.disabledPrevious = false;
    if (!response) {
      this.properties = [];
      this.count = 0;
      this.disabledNext = true;
      this.disabledPrevious = true;
      return;
    }
    const payload = response.data ? (response.data.properties || response.data.property || response) : response;
    this.properties = payload.results || [];
    this.count = payload.count || 0;
    if (payload.next) { this.next = payload.next; } else { this.disabledNext = true; }
    if (payload.previous) { this.previous = payload.previous; } else { this.disabledPrevious = true; }
  }

  get markers(): MapMarker[] {
    return (this.properties || []).map((p: any) => ({
      lat: parseFloat(p?.coordinates?.lat),
      lon: parseFloat(p?.coordinates?.lon),
      title: p.title,
      slug: p.slug,
      price: `₦${Number(p.price).toLocaleString()}`
    })).filter(m => !isNaN(m.lat) && !isNaN(m.lon));
  }

  fetchNext() { this.setPage(this.next); }
  fetchPrevious() { this.setPage(this.previous); }
}
