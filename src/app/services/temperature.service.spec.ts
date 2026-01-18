import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TemperatureService } from './temperature.service';

describe('TemperatureService', () => {
  let service: TemperatureService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TemperatureService]
    });
    service = TestBed.inject(TemperatureService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch temperature array from JSON file', () => {
    const mockArray = [
      { id: 'gauge-1', label: 'Living Room', minTemp: 10, maxTemp: 30, currentTemp: 22, humidity: 45 },
      { id: 'gauge-2', label: 'Bedroom', minTemp: 15, maxTemp: 28, currentTemp: 20, humidity: 52 }
    ];

    service.getTemperatureArray().subscribe((data: any) => {
      expect(data).toEqual(mockArray);
      expect(data.length).toBe(2);
    });

    const req = httpMock.expectOne('data/temperature-array.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockArray);
  });

  it('should fetch temperature from API endpoint', () => {
    const deviceId = 'device-123';
    const mockData = { temperature: { current: 25 } };

    service.getTemperatureFromAPI(deviceId).subscribe((data: any) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne(`/api/temperature/${deviceId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should handle HTTP errors gracefully', () => {
    const errorMessage = 'Failed to load data';

    service.getTemperatureArray().subscribe(
      () => fail('should have failed with 404 error'),
      (error: any) => {
        expect(error.status).toBe(404);
      }
    );

    const req = httpMock.expectOne('data/temperature-array.json');
    req.flush(errorMessage, { status: 404, statusText: 'Not Found' });
  });
});
