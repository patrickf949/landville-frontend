import {
  Component, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit,
  Output, PLATFORM_ID, SimpleChanges
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare const L: any;

export interface MapMarker {
  lat: number;
  lon: number;
  title?: string;
  slug?: string;
  price?: string;
}

const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const TILES = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; OpenStreetMap contributors';
const DEFAULT_CENTER: [number, number] = [9.0765, 7.4712]; // Abuja

let leafletLoader: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (typeof (window as any).L !== 'undefined') { return Promise.resolve(); }
  if (leafletLoader) { return leafletLoader; }
  leafletLoader = new Promise<void>((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = LEAFLET_CSS;
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.onload = () => resolve();
    script.onerror = () => reject();
    document.head.appendChild(script);
  });
  return leafletLoader;
}

@Component({
  selector: 'app-map',
  standalone: false,
  template: '<div class="app-map" [id]="mapId"></div>',
  styles: ['.app-map { width: 100%; height: 100%; min-height: 280px; border-radius: 12px; z-index: 0; }']
})
export class MapComponent implements OnInit, OnChanges, OnDestroy {
  /** pick: draggable marker emits coordinates (listing form)
   *  single: one fixed marker (property details)
   *  results: many markers with popups (search results) */
  @Input() mode: 'pick' | 'single' | 'results' = 'single';
  @Input() lat: number | null = null;
  @Input() lon: number | null = null;
  @Input() markers: MapMarker[] = [];
  @Input() zoom = 13;
  @Output() coordsChange = new EventEmitter<{ lat: number; lon: number }>();

  mapId = `map-${Math.random().toString(36).slice(2)}`;
  private map: any = null;
  private layerGroup: any = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) { return; }
    loadLeaflet().then(() => this.initMap()).catch(() => undefined);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.map) { this.render(); }
  }

  ngOnDestroy(): void {
    if (this.map) { this.map.remove(); }
  }

  private initMap(): void {
    const center: [number, number] =
      this.lat != null && this.lon != null
        ? [this.lat, this.lon] : DEFAULT_CENTER;
    this.map = L.map(this.mapId).setView(center, this.zoom);
    L.tileLayer(TILES, { attribution: ATTRIBUTION }).addTo(this.map);
    this.layerGroup = L.layerGroup().addTo(this.map);
    this.render();
    if (this.mode === 'pick') {
      this.map.on('click', (e: any) => {
        this.setPickMarker(e.latlng.lat, e.latlng.lng);
        this.coordsChange.emit({ lat: e.latlng.lat, lon: e.latlng.lng });
      });
    }
    setTimeout(() => this.map.invalidateSize(), 200);
  }

  private render(): void {
    this.layerGroup.clearLayers();
    if (this.mode === 'results') {
      const bounds: any[] = [];
      this.markers.forEach(m => {
        if (m.lat == null || m.lon == null || isNaN(m.lat)) { return; }
        const marker = L.marker([m.lat, m.lon]).addTo(this.layerGroup);
        const link = m.slug ? `/properties/${m.slug}` : '#';
        marker.bindPopup(
          `<strong>${m.title || 'Listing'}</strong><br>` +
          `${m.price || ''}<br><a href="${link}">View listing</a>`);
        bounds.push([m.lat, m.lon]);
      });
      if (bounds.length) { this.map.fitBounds(bounds, { padding: [30, 30] }); }
      return;
    }
    if (this.lat != null && this.lon != null && !isNaN(this.lat)) {
      this.setPickMarker(this.lat, this.lon);
      this.map.setView([this.lat, this.lon], this.zoom);
    }
  }

  private setPickMarker(lat: number, lon: number): void {
    this.layerGroup.clearLayers();
    const marker = L.marker([lat, lon], {
      draggable: this.mode === 'pick'
    }).addTo(this.layerGroup);
    if (this.mode === 'pick') {
      marker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        this.coordsChange.emit({ lat: pos.lat, lon: pos.lng });
      });
    }
  }
}
