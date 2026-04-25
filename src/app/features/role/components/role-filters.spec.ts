import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RoleFiltersComponent } from './role-filters.component';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';

describe('RoleFiltersComponent', () => {
  let component: RoleFiltersComponent;
  let fixture: ComponentFixture<RoleFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleFiltersComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFiltersComponent);
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
        isFirstChange: () => true
      }
    });
    expect(component.filterForm.value.active).toBe('true');
    expect(component.filterForm.value.createdAt.start).toBe('2023-01-01');
  });

  it('should emit filter values on apply', () => {
    const spy = vi.spyOn(component.onFilter, 'emit');
    fixture.detectChanges();
    component.filterForm.patchValue({ active: 'true' });
    component.handleApply();
    expect(spy).toHaveBeenCalledWith({ active: 'true' });
  });

  it('should emit empty filter on clear', () => {
    const spy = vi.spyOn(component.onFilter, 'emit');
    fixture.detectChanges();
    component.handleClear();
    expect(spy).toHaveBeenCalledWith({});
  });

  it('should handle createdAt in apply', () => {
    const spy = vi.spyOn(component.onFilter, 'emit');
    fixture.detectChanges();
    component.filterForm.patchValue({ createdAt: { start: '2023-01-01', end: '2023-01-02' } });
    component.handleApply();
    expect(spy).toHaveBeenCalledWith({ createdAt_start: '2023-01-01', createdAt_end: '2023-01-02' });
  });
});
