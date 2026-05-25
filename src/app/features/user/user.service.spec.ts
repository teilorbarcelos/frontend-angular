import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { firstValueFrom } from 'rxjs';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getUsers calls correct endpoint with all options', async () => {
    const promise = firstValueFrom(
      service.getUsers({
        all: true,
        searchWord: 'test',
        searchFields: ['name'],
        sort: { orderBy: 'name', orderDirection: 'desc' },
        filters: { active: true },
      }),
    );

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/user/all' &&
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

  it('getUser calls correct endpoint', async () => {
    const promise = firstValueFrom(service.getUser('1'));

    const req = httpMock.expectOne('/v1/user/1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: '1', name: 'John' });

    const data = await promise;
    expect(data).toEqual({ id: '1', name: 'John' } as any);
  });

  it('createUser calls correct endpoint', async () => {
    const user = { name: 'John', email: 'john@example.com', id_role: '1' };
    const promise = firstValueFrom(service.createUser(user));

    const req = httpMock.expectOne('/v1/user');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush({ id: '1', ...user, active: true });

    const data = await promise;
    expect(data).toEqual({ id: '1', ...user, active: true });
  });

  it('updateUser calls correct endpoint', async () => {
    const data = { name: 'John Doe' };
    const promise = firstValueFrom(service.updateUser('1', data));

    const req = httpMock.expectOne('/v1/user/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(data);
    req.flush({ id: '1', name: 'John Doe' });

    const res = await promise;
    expect(res).toEqual({ id: '1', name: 'John Doe' } as any);
  });

  it('getUsers handles searchWord without searchFields', async () => {
    const promise = firstValueFrom(service.getUsers({ searchWord: 'test' }));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/user' &&
        request.params.get('searchWord') === 'test' &&
        !request.params.has('searchFields'),
    );
    req.flush({ items: [], total: 0 });
    await promise;
  });

  it('getUsers handles sorting without orderBy', async () => {
    const promise = firstValueFrom(service.getUsers({ sort: {} }));

    const req = httpMock.expectOne(
      (request) => request.url === '/v1/user' && !request.params.has('orderBy'),
    );
    req.flush({ items: [], total: 0 });
    await promise;
  });

  it('deleteUser calls correct endpoint', async () => {
    const promise = firstValueFrom(service.deleteUser('1'));

    const req = httpMock.expectOne('/v1/user/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    await promise;
  });

  it('toggleStatus calls correct endpoint', async () => {
    const promise = firstValueFrom(service.toggleStatus('1', false));

    const req = httpMock.expectOne('/v1/user/1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ active: false });
    req.flush({});

    await promise;
  });

  it('exportUsersPdf calls correct endpoint with blob responseType', async () => {
    const options = {
      searchWord: 'john',
      searchFields: ['name'],
      sort: { orderBy: 'email', orderDirection: 'asc' },
      filters: { active: true },
    };
    const mockBlob = new Blob(['pdf'], { type: 'application/pdf' });

    const promise = firstValueFrom(service.exportUsersPdf(options));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/user/export/pdf' &&
        request.params.get('searchWord') === 'john' &&
        request.params.get('searchFields') === 'name' &&
        request.params.get('orderBy') === 'email' &&
        request.params.get('orderDirection') === 'asc' &&
        request.params.get('active') === 'true',
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);

    const result = await promise;
    expect(result).toBe(mockBlob);
  });

  it('getUsers handles sorting with orderBy but without orderDirection', async () => {
    const promise = firstValueFrom(service.getUsers({ sort: { orderBy: 'name' } }));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/user' &&
        request.params.get('orderBy') === 'name' &&
        !request.params.has('orderDirection'),
    );
    req.flush({ items: [], total: 0 });
    await promise;
  });

  it('exportUsersPdf handles options when searchWord/sort options are partially present or missing', async () => {
    const promise1 = firstValueFrom(
      service.exportUsersPdf({
        searchWord: 'john',
        sort: { orderBy: 'email' },
      }),
    );

    const req1 = httpMock.expectOne(
      (request) =>
        request.url === '/v1/user/export/pdf' &&
        request.params.get('searchWord') === 'john' &&
        !request.params.has('searchFields') &&
        request.params.get('orderBy') === 'email' &&
        !request.params.has('orderDirection'),
    );
    req1.flush(new Blob());
    await promise1;

    const promise2 = firstValueFrom(service.exportUsersPdf({}));
    const req2 = httpMock.expectOne(
      (request) =>
        request.url === '/v1/user/export/pdf' &&
        !request.params.has('searchWord') &&
        !request.params.has('orderBy'),
    );
    req2.flush(new Blob());
    await promise2;
  });
});
