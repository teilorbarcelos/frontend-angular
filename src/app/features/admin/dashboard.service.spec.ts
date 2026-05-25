import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DashboardService } from './dashboard.service';
import { firstValueFrom } from 'rxjs';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch stats with start and end date params', async () => {
    const mockStats = {
      userCreationStats: [{ date: '2026-05-01', count: 5 }],
      productCreationStats: [{ date: '2026-05-01', count: 10 }],
      productsPerUser: [{ userId: '1', userName: 'User 1', count: 3 }],
    };

    const promise = firstValueFrom(service.getStats('2026-05-01', '2026-05-31'));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/dashboard/stats' &&
        request.params.get('createdAt_start') === '2026-05-01' &&
        request.params.get('createdAt_end') === '2026-05-31',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);

    const data = await promise;
    expect(data).toEqual(mockStats);
  });

  it('should fetch stats without date params', async () => {
    const mockStats = {
      userCreationStats: [],
      productCreationStats: [],
      productsPerUser: [],
    };

    const promise = firstValueFrom(service.getStats());

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/dashboard/stats' &&
        !request.params.has('createdAt_start') &&
        !request.params.has('createdAt_end'),
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockStats);

    await promise;
  });
});
