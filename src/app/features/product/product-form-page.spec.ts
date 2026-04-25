import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProductFormPageComponent } from './product-form-page.component';
import { ProductService } from './product.service';
import { ToastService } from '../../core/services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';

describe('ProductFormPageComponent', () => {
  let component: ProductFormPageComponent;
  let fixture: ComponentFixture<ProductFormPageComponent>;
  let mockProductService: any;
  let mockToastService: any;
  let mockRouter: any;
  let routeParams: BehaviorSubject<any>;

  beforeEach(async () => {
    routeParams = new BehaviorSubject({});
    mockProductService = {
      getProduct: vi.fn(),
      createProduct: vi.fn().mockReturnValue(of({})),
      updateProduct: vi.fn().mockReturnValue(of({})),
    };
    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProductFormPageComponent, ReactiveFormsModule],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
        { 
          provide: ActivatedRoute, 
          useValue: { params: routeParams.asObservable() } 
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFormPageComponent);
    component = fixture.componentInstance;
  });

  it('should create in "New" mode', () => {
    routeParams.next({ id: 'new' });
    fixture.detectChanges();
    expect(component.isEditing()).toBe(false);
  });

  it('should load product in "Edit" mode', async () => {
    const mockProduct = { name: 'P1', sku: 'S1', category: 'C1', price: 10, stock: 100, description: 'D1' };
    mockProductService.getProduct.mockReturnValue(of(mockProduct));
    
    routeParams.next({ id: '123' });
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component.isEditing()).toBe(true);
    expect(mockProductService.getProduct).toHaveBeenCalledWith('123');
    expect(component.productForm.value).toEqual(mockProduct);
  });

  it('should handle error loading product', async () => {
    mockProductService.getProduct.mockReturnValue(throwError(() => new Error('API Error')));
    
    routeParams.next({ id: '123' });
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(mockToastService.error).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should not submit if form is invalid', async () => {
    fixture.detectChanges();
    await component.onSubmit();
    expect(mockProductService.createProduct).not.toHaveBeenCalled();
    expect(component.productForm.touched).toBe(true);
  });

  it('should submit new product successfully', async () => {
    fixture.detectChanges();
    component.productForm.patchValue({
      name: 'P1', sku: 'S1', category: 'C1', price: 10, stock: 100, description: 'D1'
    });
    
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit', null);
    await fixture.whenStable();
    
    expect(mockProductService.createProduct).toHaveBeenCalled();
    expect(mockToastService.success).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should submit updated product successfully', async () => {
    mockProductService.getProduct.mockReturnValue(of({}));
    routeParams.next({ id: '123' });
    fixture.detectChanges();
    
    component.productForm.patchValue({
      name: 'P1', sku: 'S1', category: 'C1', price: 10, stock: 100, description: 'D1'
    });
    
    await component.onSubmit();
    expect(mockProductService.updateProduct).toHaveBeenCalledWith('123', expect.anything());
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('should handle submit error', async () => {
    fixture.detectChanges();
    component.productForm.patchValue({
      name: 'P1', sku: 'S1', category: 'C1', price: 10, stock: 100, description: 'D1'
    });
    mockProductService.createProduct.mockReturnValue(throwError(() => new Error('API Error')));
    
    await component.onSubmit();
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should navigate back on cancel', () => {
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should return error message for getError', () => {
    fixture.detectChanges();
    const control = component.productForm.get('name');
    control?.markAsTouched();
    control?.setErrors({ required: true });
    
    expect(component.getError('name')).toBe('Este campo é obrigatório');
  });

  it('should return correct error message for min error', () => {
    fixture.detectChanges();
    const control = component.productForm.get('price')!;
    control.markAsTouched();
    control.setErrors({ min: { min: 10, actual: 5 } });
    fixture.detectChanges();
    expect(component.getError('price')).toBe('Valor inválido');
  });

  it('should trigger cancel from footer button', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'cancel');
    const footerCancelBtn = fixture.debugElement.queryAll(By.css('app-button'))
      .find(el => el.nativeElement.textContent.includes('Cancelar') && el.attributes['variant'] === 'secondary');
    
    footerCancelBtn?.triggerEventHandler('onClick', null);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should trigger cancel from header button', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'cancel');
    const headerCancelBtn = fixture.debugElement.queryAll(By.css('app-button'))
      .find(el => el.nativeElement.textContent.includes('Cancelar') && el.attributes['variant'] === 'ghost');
    
    headerCancelBtn?.triggerEventHandler('onClick', null);
    fixture.detectChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('should render correct button text when pending', () => {
    component.isPending.set(true);
    fixture.detectChanges();
    const submitBtn = fixture.nativeElement.querySelector('button[type="submit"]');
    expect(submitBtn.textContent).toContain('Salvando...');
    
    component.isPending.set(false);
    component.isEditing.set(true);
    fixture.detectChanges();
    expect(submitBtn.textContent).toContain('Atualizar Produto');
  });
});
