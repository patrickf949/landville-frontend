import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SimpleChange, PLATFORM_ID } from '@angular/core';
import { MapComponent, MapMarker } from './map.component';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;

  let mockMap: any;
  let mockLayerGroup: any;
  let mockMarker: any;
  let mapClickCallback: Function | null = null;
  let dragendCallback: Function | null = null;

  beforeEach(async () => {
    mapClickCallback = null;
    dragendCallback = null;

    mockMarker = {
      addTo: jasmine.createSpy('addTo').and.callFake(function() { return this; }),
      bindPopup: jasmine.createSpy('bindPopup').and.callFake(function() { return this; }),
      on: jasmine.createSpy('on').and.callFake(function(evt: string, cb: Function) {
        if (evt === 'dragend') {
          dragendCallback = cb;
        }
        return this;
      })
    };

    mockLayerGroup = {
      addTo: jasmine.createSpy('addTo').and.callFake(function() { return this; }),
      clearLayers: jasmine.createSpy('clearLayers')
    };

    mockMap = {
      setView: jasmine.createSpy('setView').and.callFake(function() { return this; }),
      on: jasmine.createSpy('on').and.callFake(function(evt: string, cb: Function) {
        if (evt === 'click') {
          mapClickCallback = cb;
        }
        return this;
      }),
      fitBounds: jasmine.createSpy('fitBounds'),
      invalidateSize: jasmine.createSpy('invalidateSize'),
      remove: jasmine.createSpy('remove')
    };

    // Set global Leaflet object L on window
    (window as any).L = {
      map: jasmine.createSpy('map').and.returnValue(mockMap),
      tileLayer: jasmine.createSpy('tileLayer').and.returnValue({
        addTo: jasmine.createSpy('addTo')
      }),
      layerGroup: jasmine.createSpy('layerGroup').and.returnValue(mockLayerGroup),
      marker: jasmine.createSpy('marker').and.returnValue(mockMarker)
    };

    await TestBed.configureTestingModule({
      declarations: [ MapComponent ],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    delete (window as any).L;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize map in single mode on init', fakeAsync(() => {
    component.lat = 9.0765;
    component.lon = 7.4712;
    component.mode = 'single';
    fixture.detectChanges();
    tick(250);

    expect(component).toBeTruthy();
    expect((window as any).L.map).toHaveBeenCalledWith(component.mapId);
    expect(mockMap.setView).toHaveBeenCalledWith([9.0765, 7.4712], 13);
    expect(mockLayerGroup.clearLayers).toHaveBeenCalled();
  }));

  it('should initialize map in pick mode and respond to map click and marker drag', fakeAsync(() => {
    component.mode = 'pick';
    component.lat = 10;
    component.lon = 20;
    spyOn(component.coordsChange, 'emit');

    fixture.detectChanges();
    tick(250);

    expect(mockMap.on).toHaveBeenCalledWith('click', jasmine.any(Function));

    // Simulate click on map
    if (mapClickCallback) {
      mapClickCallback({ latlng: { lat: 15.5, lng: 25.5 } });
      expect(component.coordsChange.emit).toHaveBeenCalledWith({ lat: 15.5, lon: 25.5 });
    }

    // Simulate dragend on marker
    if (dragendCallback) {
      dragendCallback({ target: { getLatLng: () => ({ lat: 18.0, lng: 28.0 }) } });
      expect(component.coordsChange.emit).toHaveBeenCalledWith({ lat: 18.0, lon: 28.0 });
    }
  }));

  it('should initialize map in results mode and render markers with popups', fakeAsync(() => {
    component.mode = 'results';
    const mockMarkers: MapMarker[] = [
      { lat: 1.0, lon: 2.0, title: 'House 1', price: '$100k', slug: 'house-1' },
      { lat: 3.0, lon: 4.0, title: 'House 2', price: '$200k', slug: 'house-2' }
    ];
    component.markers = mockMarkers;

    fixture.detectChanges();
    tick(250);

    expect((window as any).L.marker).toHaveBeenCalledWith([1.0, 2.0]);
    expect((window as any).L.marker).toHaveBeenCalledWith([3.0, 4.0]);
    expect(mockMarker.bindPopup).toHaveBeenCalled();
    expect(mockMap.fitBounds).toHaveBeenCalledWith([[1.0, 2.0], [3.0, 4.0]], { padding: [30, 30] });
  }));

  it('should re-render on ngOnChanges if map exists', fakeAsync(() => {
    fixture.detectChanges();
    tick(250);

    component.lat = 12.3;
    component.lon = 45.6;
    component.ngOnChanges({
      lat: new SimpleChange(null, 12.3, false)
    });

    expect(mockMap.setView).toHaveBeenCalledWith([12.3, 45.6], 13);
  }));

  it('should cleanup map on ngOnDestroy', fakeAsync(() => {
    fixture.detectChanges();
    tick(250);

    component.ngOnDestroy();
    expect(mockMap.remove).toHaveBeenCalled();
  }));

  describe('Non-browser platform (SSR)', () => {
    let serverFixture: ComponentFixture<MapComponent>;
    let serverComponent: MapComponent;

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        declarations: [ MapComponent ],
        providers: [
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      serverFixture = TestBed.createComponent(MapComponent);
      serverComponent = serverFixture.componentInstance;
    });

    it('should skip map initialization when running on server', () => {
      serverFixture.detectChanges();
      expect((serverComponent as any).map).toBeNull();
    });
  });
});
