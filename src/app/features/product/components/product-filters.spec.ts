import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProductFiltersComponent } from './product-filters.component';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';

describe('ProductFiltersComponent', () => {
  let component: ProductFiltersComponent;
  let fixture: ComponentFixture<ProductFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductFiltersComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with initialValues', () => {
    component.initialValues = { active: 'true', createdAt_start: '2023-01-01', createdAt_end: '2023-01-02' };
    (component as any).updateFormValues();
    
    expect(component.filterForm.value.active).toBe('true');
    expect(component.filterForm.value.createdAt).toEqual({
      start: '2023-01-01',
      end: '2023-01-02'
    });
  });

  it('should handle clear', () => {
    const filterSpy = vi.spyOn(component.onFilter, 'emit');
    const closeSpy = vi.spyOn(component.onClose, 'emit');
    
    component.handleClear();
    
    expect(component.filterForm.value.active).toBe('');
    expect(filterSpy).toHaveBeenCalledWith({});
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should handle apply', () => {
    const filterSpy = vi.spyOn(component.onFilter, 'emit');
    const closeSpy = vi.spyOn(component.onClose, 'emit');
    
    component.filterForm.patchValue({
      active: 'true',
      createdAt: { start: '2023-01-01', end: '2023-01-02' }
    });
    
    component.handleApply();
    
    expect(filterSpy).toHaveBeenCalledWith({
      active: 'true',
      createdAt_start: '2023-01-01',
      createdAt_end: '2023-01-02'
    });
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should update values onChanges', () => {
    const spy = vi.spyOn(component as any, 'updateFormValues');
    component.initialValues = { active: 'true' };
    component.ngOnChanges({
      initialValues: {
        currentValue: { active: 'true' },
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });
    expect(spy).toHaveBeenCalled();
  });

  it('should handle apply with empty values', () => {
    const filterSpy = vi.spyOn(component.onFilter, 'emit');
    component.filterForm.patchValue({
      active: '',
      createdAt: { start: '', end: '' }
    });
    component.handleApply();
    expect(filterSpy).toHaveBeenCalledWith({});
  });

  it('should not update values onChanges if initialValues is missing', () => {
    const spy = vi.spyOn(component as any, 'updateFormValues');
    component.initialValues = null as any;
    component.ngOnChanges({
      initialValues: {
        currentValue: null,
        previousValue: {},
        firstChange: false,
        isFirstChange: () => false
      }
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('should trigger handleClear from template', () => {
    const spy = vi.spyOn(component, 'handleClear');
    const drawer = fixture.debugElement.query(By.css('app-filter-drawer')).componentInstance;
    drawer.onClear.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should trigger handleApply from template', () => {
    const spy = vi.spyOn(component, 'handleApply');
    const drawer = fixture.debugElement.query(By.css('app-filter-drawer')).componentInstance;
    drawer.onApply.emit();
    expect(spy).toHaveBeenCalled();
  });
});
