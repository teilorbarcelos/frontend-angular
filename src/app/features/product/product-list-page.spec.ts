import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProductListPageComponent } from './product-list-page.component';
import { ProductService } from './product.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { signal } from '@angular/core';

describe('ProductListPageComponent', () => {
  let component: ProductListPageComponent;
  let fixture: ComponentFixture<ProductListPageComponent>;
  let mockProductService: any;
  let mockAuthService: any;
  let mockToastService: any;
  let router: Router;

  const mockProducts = [
    { id: '1', name: 'P1', sku: 'S1', category: 'C1', price: 10, stock: 100, active: true },
  ];

  beforeEach(async () => {
    mockProductService = {
      getProducts: vi.fn().mockReturnValue(of({ items: mockProducts, total: 1 })),
      toggleStatus: vi.fn().mockReturnValue(of({})),
      deleteProduct: vi.fn().mockReturnValue(of({})),
    };

    mockAuthService = {
      hasPermission: vi.fn().mockReturnValue(true),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductListPageComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(ProductListPageComponent);
    component = fixture.componentInstance;
    // No fixture.detectChanges() here because effect will run on first detection
  });

  it('should create and load products', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component.products()).toEqual(mockProducts);
    expect(mockProductService.getProducts).toHaveBeenCalled();
  });

  it('should handle search', () => {
    fixture.detectChanges();
    component.handleSearch('test');
    expect(component.searchWord()).toBe('test');
    expect(component.page()).toBe(0);
  });

  it('should handle filters', () => {
    fixture.detectChanges();
    component.handleFilter({ category: 'C1' });
    expect(component.filters()).toEqual({ category: 'C1' });
    expect(component.page()).toBe(0);
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    component.handlePageChange(2);
    expect(component.page()).toBe(2);
  });

  it('should toggle filter drawer', () => {
    fixture.detectChanges();
    component.toggleFilter();
    expect(component.isFilterOpen()).toBe(true);
    component.toggleFilter();
    expect(component.isFilterOpen()).toBe(false);
  });

  it('should navigate to create', () => {
    const spy = vi.spyOn(router, 'navigate');
    component.navigateToCreate();
    expect(spy).toHaveBeenCalledWith(['/products/new']);
  });

  it('should navigate to edit', () => {
    const spy = vi.spyOn(router, 'navigate');
    component.navigateToEdit('1');
    expect(spy).toHaveBeenCalledWith(['/products/update', '1']);
  });

  it('should toggle status successfully', async () => {
    fixture.detectChanges();
    await component.toggleStatus('1', false);
    expect(mockProductService.toggleStatus).toHaveBeenCalledWith('1', false);
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('should handle toggle status error', async () => {
    mockProductService.toggleStatus.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    await component.toggleStatus('1', false);
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should delete product successfully', async () => {
    fixture.detectChanges();
    await component.deleteProduct('1');
    expect(mockProductService.deleteProduct).toHaveBeenCalledWith('1');
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    mockProductService.deleteProduct.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    await component.deleteProduct('1');
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should handle error loading products', async () => {
    mockProductService.getProducts.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mockToastService.error).toHaveBeenCalled();
  });
});
