import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PropertiesResponse } from 'src/app/models/Property';
import { APPCONFIG } from 'src/app/config';

export interface PropertyFilters {
  listing_type?: string;
  property_type?: string;
  city?: string;
  price_min?: string;
  price_max?: string;
  bedrooms?: string;
  rent_period?: string;
  distance_to_main_road?: string;
  distance_to_city?: string;
  noise_level?: string;
  amenities?: number[];
  nearby?: number[];
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PropertiesService {
  private base = `${APPCONFIG.base_url}/properties/`;

  constructor(private http: HttpClient) { }

  getProperties(propertiesUrl: string): Observable<any> {
    return this.http.get<PropertiesResponse>(propertiesUrl);
  }

  searchProperties(filters: PropertyFilters): Observable<any> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') { return; }
      if (Array.isArray(value)) {
        value.forEach(v => params = params.append(key, String(v)));
      } else {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<PropertiesResponse>(this.base, { params });
  }

  getAmenities(): Observable<any> {
    return this.http.get(`${this.base}amenities/`);
  }

  getNearbyFeatures(): Observable<any> {
    return this.http.get(`${this.base}nearby-features/`);
  }

  createProperty(payload: FormData): Observable<any> {
    return this.http.post(this.base, payload);
  }

  updateProperty(slug: string, payload: FormData): Observable<any> {
    return this.http.patch(`${this.base}${slug}/`, payload);
  }

  deleteProperty(slug: string): Observable<any> {
    return this.http.delete(`${this.base}${slug}/`);
  }

  updateStatus(slug: string, status: string): Observable<any> {
    return this.http.patch(`${this.base}${slug}/status/`, { status });
  }

  getSavedProperties(): Observable<any> {
    return this.http.get(`${this.base}buyer-list/`);
  }

  toggleSavedProperty(slug: string, save: boolean): Observable<any> {
    const url = `${this.base}buyer-list/${slug}/`;
    return save ? this.http.post(url, {}) : this.http.delete(url);
  }
}
