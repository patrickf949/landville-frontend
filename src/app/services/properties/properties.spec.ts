import { LocalStorageService } from "src/app/services/local-storage.service";
import { TestBed } from "@angular/core/testing";
import {
  HttpTestingController,
  HttpClientTestingModule
} from "@angular/common/http/testing";

import { PropertiesService, PropertyFilters } from "./properties.service";
import { APPCONFIG } from "src/app/config";

describe("PropertiesService", () => {
  let service: PropertiesService;
  let httpMock: HttpTestingController;
  const base = `${APPCONFIG.base_url}/properties/`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PropertiesService, LocalStorageService]
    });
    service = TestBed.inject(PropertiesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should send a GET method for getProperties", () => {
    const mockUrl = "http://127.0.0.1:8000/api/v1/properties/";
    service.getProperties(mockUrl).subscribe(res => {
      expect(res).toBeDefined();
    });
    const req = httpMock.expectOne(mockUrl);
    expect(req.request.method).toBe("GET");
    req.flush({ count: 0, results: [] });
  });

  it("should format query params and send GET for searchProperties", () => {
    const filters: PropertyFilters = {
      city: 'Kigali',
      amenities: [1, 2],
      search: 'house'
    };
    service.searchProperties(filters).subscribe();
    const req = httpMock.expectOne(r => r.url === base && r.params.get('city') === 'Kigali');
    expect(req.request.method).toBe("GET");
    expect(req.request.params.getAll('amenities')).toEqual(['1', '2']);
    req.flush({ results: [] });
  });

  it("should send GET for getAmenities and getNearbyFeatures", () => {
    service.getAmenities().subscribe();
    const req1 = httpMock.expectOne(`${base}amenities/`);
    expect(req1.request.method).toBe("GET");
    req1.flush([]);

    service.getNearbyFeatures().subscribe();
    const req2 = httpMock.expectOne(`${base}nearby-features/`);
    expect(req2.request.method).toBe("GET");
    req2.flush([]);
  });

  it("should send POST for createProperty", () => {
    const formData = new FormData();
    service.createProperty(formData).subscribe();
    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe("POST");
    req.flush({ id: 1 });
  });

  it("should send GET for getProperty", () => {
    service.getProperty("my-slug").subscribe();
    const req = httpMock.expectOne(`${base}my-slug/`);
    expect(req.request.method).toBe("GET");
    req.flush({ slug: "my-slug" });
  });

  it("should send PATCH method for updateProperty", () => {
    const mockSlug = "test-property";
    const payload = new FormData();
    payload.append("is_published", "true");
    
    service.updateProperty(mockSlug, payload).subscribe();
    
    const req = httpMock.expectOne(`${base}${mockSlug}/`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toBe(payload);
    req.flush({});
  });

  it("should send DELETE for deleteProperty", () => {
    service.deleteProperty("test-slug").subscribe();
    const req = httpMock.expectOne(`${base}test-slug/`);
    expect(req.request.method).toBe("DELETE");
    req.flush({});
  });

  it("should send request for deletePropertyResource", () => {
    service.deletePropertyResource("test-slug", { image_id: 1 }).subscribe();
    const req = httpMock.expectOne(`${base}test-slug/resource`);
    expect(req.request.method).toBe("DELETE");
    expect(req.request.body).toEqual({ image_id: 1 });
    req.flush({});
  });

  it("should send a PATCH method for updateStatus", () => {
    const mockSlug = "test-property";
    const status = "sold";
    
    service.updateStatus(mockSlug, status).subscribe();
    
    const req = httpMock.expectOne(`${base}${mockSlug}/status/`);
    expect(req.request.method).toBe("PATCH");
    expect(req.request.body).toEqual({ status });
    req.flush({});
  });

  it("should send GET for getSavedProperties", () => {
    service.getSavedProperties().subscribe();
    const req = httpMock.expectOne(`${base}buyer-list/`);
    expect(req.request.method).toBe("GET");
    req.flush([]);
  });

  it("should send POST or DELETE for toggleSavedProperty", () => {
    service.toggleSavedProperty("test-slug", true).subscribe();
    const req1 = httpMock.expectOne(`${base}buyer-list/test-slug/`);
    expect(req1.request.method).toBe("POST");
    req1.flush({});

    service.toggleSavedProperty("test-slug", false).subscribe();
    const req2 = httpMock.expectOne(`${base}buyer-list/test-slug/`);
    expect(req2.request.method).toBe("DELETE");
    req2.flush({});
  });
});
