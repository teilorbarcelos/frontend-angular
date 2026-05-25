import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RoleService } from './role.service';
import { firstValueFrom } from 'rxjs';

describe('RoleService', () => {
  let service: RoleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RoleService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RoleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getRoles calls correct endpoint with all options', async () => {
    const promise = firstValueFrom(
      service.getRoles({
        all: true,
        searchWord: 'test',
        searchFields: ['name'],
        sort: { orderBy: 'name', orderDirection: 'desc' },
        filters: { active: true },
      }),
    );

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/role/all' &&
        request.params.get('searchWord') === 'test' &&
        request.params.get('searchFields') === 'name' &&
        request.params.get('orderBy') === 'name' &&
        request.params.get('orderDirection') === 'desc' &&
        request.params.get('active') === 'true',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ items: [], total: 0 });

    const data = await promise;
    expect(data).toEqual({ items: [], total: 0 });
  });

  it('getRole calls correct endpoint', async () => {
    const promise = firstValueFrom(service.getRole('1'));

    const req = httpMock.expectOne('/v1/role/1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: '1', name: 'Admin' });

    const data = await promise;
    expect(data).toEqual({ id: '1', name: 'Admin' } as any);
  });

  it('getFeatures calls correct endpoint', async () => {
    const promise = firstValueFrom(service.getFeatures());

    const req = httpMock.expectOne('/v1/role/features');
    expect(req.request.method).toBe('GET');
    req.flush([]);

    const data = await promise;
    expect(data).toEqual([]);
  });

  it('createRole calls correct endpoint', async () => {
    const role = { name: 'R1', description: 'D1', permissions: [] };
    const promise = firstValueFrom(service.createRole(role));

    const req = httpMock.expectOne('/v1/role');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(role);
    req.flush({ id: '1', ...role });

    const data = await promise;
    expect(data).toEqual({ id: '1', ...role });
  });

  it('updateRole calls correct endpoint', async () => {
    const data = { name: 'R2', description: 'D2', permissions: [] };
    const promise = firstValueFrom(service.updateRole('1', data));

    const req = httpMock.expectOne('/v1/role/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    req.flush({ id: '1', ...data });

    const res = await promise;
    expect(res).toEqual({ id: '1', ...data });
  });

  it('getRoles handles searchWord without searchFields', async () => {
    const promise = firstValueFrom(service.getRoles({ searchWord: 'test' }));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/role' &&
        request.params.get('searchWord') === 'test' &&
        !request.params.has('searchFields'),
    );
    req.flush({ items: [], total: 0 });
    await promise;
  });

  it('getRoles handles sorting without orderBy', async () => {
    const promise = firstValueFrom(service.getRoles({ sort: {} }));

    const req = httpMock.expectOne(
      (request) => request.url === '/v1/role' && !request.params.has('orderBy'),
    );
    req.flush({ items: [], total: 0 });
    await promise;
  });

  it('deleteRole calls correct endpoint', async () => {
    const promise = firstValueFrom(service.deleteRole('1'));

    const req = httpMock.expectOne('/v1/role/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    await promise;
  });

  it('toggleStatus calls correct endpoint', async () => {
    const promise = firstValueFrom(service.toggleStatus('1', false));

    const req = httpMock.expectOne('/v1/role/1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ active: false });
    req.flush({});

    await promise;
  });

  it('mageSelect helper works correctly', async () => {
    const promise = service.mageSelect(0, 'test', { searchFields: ['name'] });

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/role' &&
        request.params.get('searchWord') === 'test' &&
        request.params.get('searchFields') === 'name' &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '10',
    );
    req.flush({ items: [{ id: '1', name: 'Admin' }], total: 1 });

    const data = await promise;
    expect(data.items.length).toBe(1);
    expect(data.hasMore).toBe(false);
  });

  it('mageHydrate helper works correctly', async () => {
    const promise = service.mageHydrate(['1', '2']);

    const req1 = httpMock.expectOne('/v1/role/1');
    req1.flush({ id: '1', name: 'Admin' });

    const req2 = httpMock.expectOne('/v1/role/2');
    req2.flush({ id: '2', name: 'User' });

    const data = await promise;
    expect(data.length).toBe(2);
    expect(data[0].id).toBe('1');
    expect(data[1].id).toBe('2');
  });

  it('mageHydrate helper handles empty array', async () => {
    const data = await service.mageHydrate([]);
    expect(data).toEqual([]);
  });

  it('mageHydrate helper handles errors', async () => {
    const promise = service.mageHydrate(['1']);

    const req = httpMock.expectOne('/v1/role/1');
    req.error(new ProgressEvent('error'));

    const data = await promise;
    expect(data).toEqual([]);
  });

  it('getRoles handles sorting with orderBy but without orderDirection', async () => {
    const promise = firstValueFrom(service.getRoles({ sort: { orderBy: 'name' } }));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/role' &&
        request.params.get('orderBy') === 'name' &&
        !request.params.has('orderDirection'),
    );
    req.flush({ items: [], total: 0 });
    await promise;
  });
});
