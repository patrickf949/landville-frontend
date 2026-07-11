import { LocalStorageService } from "src/app/services/local-storage.service";
import { TestBed } from "@angular/core/testing";
import {
  HttpTestingController,
  HttpClientTestingModule
} from "@angular/common/http/testing";

import { PropertiesService } from "../properties/properties.service";

describe("PropertiesService", () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LocalStorageService]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("should be created", () => {
    const service: PropertiesService = TestBed.inject(PropertiesService);
    expect(service).toBeTruthy();
  });

  it("should send a GET method", () => {
    const service: PropertiesService = TestBed.inject(PropertiesService);
    const mockUrl = "http://127.0.0.1:8000/api/v1/properties/";
    service.getProperties(mockUrl).subscribe();
    const req = httpMock.expectOne(mockUrl);
    expect(req.request.method).toBe("GET");
  });
});
