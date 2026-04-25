import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserFiltersComponent } from './user-filters.component';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';

describe('UserFiltersComponent', () => {
  let component: UserFiltersComponent;
  let fixture: ComponentFixture<UserFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFiltersComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFiltersComponent);
    component = fixture.componentInstance;
  });

  it('should create and initialize form', () => {
    fixture.detectChanges();
    expect(component.filterForm).toBeTruthy();
    expect(component.filterForm.value.active).toBe('');
  });

  it('should initialize with initialValues', () => {
    component.initialValues = { active: 'true', createdAt_start: '2023-01-01' };
    fixture.detectChanges();
    component.ngOnChanges({
      initialValues: {
        currentValue: component.initialValues,
        previousValue: {},
        firstChange: true,
        isFirstChange: () => true,
      },
    });
    expect(component.filterForm.value.active).toBe('true');
    expect(component.filterForm.value.createdAt.start).toBe('2023-01-01');
  });

  it('should not update if initialValues not in changes', () => {
    const spy = vi.spyOn(component.filterForm, 'patchValue');
    component.ngOnChanges({
      isOpen: {
        currentValue: true,
        previousValue: false,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    expect(spy).not.toHaveBeenCalled();
  });

  it('should handle empty initialValues', () => {
    component.initialValues = {};
    (component as any).updateFormValues();
    expect(component.filterForm.value.active).toBe('');
    expect(component.filterForm.value.createdAt.start).toBe('');
  });

  it('should emit filter values on apply', () => {
    const spy = vi.spyOn(component.filtered, 'emit');
    fixture.detectChanges();
    component.filterForm.patchValue({ active: 'true' });
    component.handleApply();
    expect(spy).toHaveBeenCalledWith({ active: 'true' });
  });

  it('should emit empty filter on clear', () => {
    const spy = vi.spyOn(component.filtered, 'emit');
    fixture.detectChanges();
    component.handleClear();
    expect(spy).toHaveBeenCalledWith({});
  });

  it('should handle createdAt in apply', () => {
    const spy = vi.spyOn(component.filtered, 'emit');
    fixture.detectChanges();
    component.filterForm.patchValue({ createdAt: { start: '2023-01-01', end: '2023-01-02' } });
    component.handleApply();
    expect(spy).toHaveBeenCalledWith({
      createdAt_start: '2023-01-01',
      createdAt_end: '2023-01-02',
    });
  });

  it('should trigger handleClear from template', () => {
    const spy = vi.spyOn(component, 'handleClear');
    const drawer = fixture.debugElement.query(By.css('app-filter-drawer')).componentInstance;
    drawer.cleared.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should trigger handleApply from template', () => {
    const spy = vi.spyOn(component, 'handleApply');
    const drawer = fixture.debugElement.query(By.css('app-filter-drawer')).componentInstance;
    drawer.applied.emit();
    expect(spy).toHaveBeenCalled();
  });

  it('should trigger closed from template', () => {
    const spy = vi.spyOn(component.closed, 'emit');
    const drawer = fixture.debugElement.query(By.css('app-filter-drawer')).componentInstance;
    drawer.closed.emit();
    expect(spy).toHaveBeenCalled();
  });
});
