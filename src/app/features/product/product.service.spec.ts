import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { firstValueFrom } from 'rxjs';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getProducts calls correct endpoint with all options', async () => {
    const promise = firstValueFrom(
      service.getProducts({
        all: true,
        searchWord: 'test',
        searchFields: ['name'],
        sort: { orderBy: 'price', orderDirection: 'desc' },
        filters: { category: 'C1' },
      }),
    );

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/product/all' &&
        request.params.get('searchWord') === 'test' &&
        request.params.get('searchFields') === 'name' &&
        request.params.get('orderBy') === 'price' &&
        request.params.get('orderDirection') === 'desc' &&
        request.params.get('category') === 'C1',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);

    const data = await promise;
    expect(data).toEqual([]);
  });

  it('getProducts calls correct endpoint with minimal options', async () => {
    const promise = firstValueFrom(service.getProducts({}));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/product' &&
        request.params.get('page') === '0' &&
        request.params.get('size') === '25',
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);

    const data = await promise;
    expect(data).toEqual([]);
  });

  it('getProducts handles searchWord without searchFields', async () => {
    const promise = firstValueFrom(service.getProducts({ searchWord: 'test' }));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/product' &&
        request.params.get('searchWord') === 'test' &&
        !request.params.has('searchFields'),
    );
    req.flush([]);
    await promise;
  });

  it('getProduct calls correct endpoint', async () => {
    const promise = firstValueFrom(service.getProduct('1'));

    const req = httpMock.expectOne('/v1/product/1');
    expect(req.request.method).toBe('GET');
    req.flush({ id: '1' });

    const data = await promise;
    expect(data).toEqual({ id: '1' } as any);
  });

  it('createProduct calls correct endpoint', async () => {
    const product = {
      name: 'P1',
      sku: 'S1',
      category: 'C1',
      price: 10,
      stock: 100,
      description: 'D1',
    };
    const promise = firstValueFrom(service.createProduct(product));

    const req = httpMock.expectOne('/v1/product');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(product);
    req.flush({ id: '1', ...product });

    const data = await promise;
    expect(data).toEqual({ id: '1', ...product } as any);
  });

  it('updateProduct calls correct endpoint', async () => {
    const partial = { name: 'P2' };
    const promise = firstValueFrom(service.updateProduct('1', partial));

    const req = httpMock.expectOne('/v1/product/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(partial);
    req.flush({ id: '1', name: 'P2' });

    const data = await promise;
    expect(data).toEqual({ id: '1', name: 'P2' } as any);
  });

  it('deleteProduct calls correct endpoint', async () => {
    const promise = firstValueFrom(service.deleteProduct('1'));

    const req = httpMock.expectOne('/v1/product/1');
    expect(req.request.method).toBe('DELETE');
    req.flush({});

    const data = await promise;
    expect(data).toEqual({});
  });

  it('toggleStatus calls correct endpoint', async () => {
    const promise = firstValueFrom(service.toggleStatus('1', true));

    const req = httpMock.expectOne('/v1/product/1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ active: true });
    req.flush({});

    const data = await promise;
    expect(data).toEqual({});
  });

  it('getProducts handles sorting with orderBy but without orderDirection', async () => {
    const promise = firstValueFrom(service.getProducts({ sort: { orderBy: 'price' } }));

    const req = httpMock.expectOne(
      (request) =>
        request.url === '/v1/product' &&
        request.params.get('orderBy') === 'price' &&
        !request.params.has('orderDirection'),
    );
    req.flush([]);
    await promise;
  });
});
