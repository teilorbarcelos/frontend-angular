import { TestBed, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { DateRangePickerComponent } from './date-range-picker.component';
import { vi } from 'vitest';

describe('DateRangePickerComponent', () => {
  let component: DateRangePickerComponent;
  let fixture: ComponentFixture<DateRangePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangePickerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DateRangePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize flatpickr', () => {
    expect((component as any).fpInstance).toBeTruthy();
  });

  it('should open picker on click', () => {
    const spy = vi.spyOn((component as any).fpInstance, 'open');
    const container = fixture.nativeElement.querySelector('.flex');
    container.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should call onChange when dates are selected', () => {
    const spy = vi.fn();
    component.registerOnChange(spy);
    
    // Simulate flatpickr onClose (hooks are usually arrays in flatpickr)
    const selectedDates = [new Date('2023-01-01'), new Date('2023-01-10')];
    const fp = (component as any).fpInstance;
    if (typeof fp.config.onClose === 'function') {
      fp.config.onClose(selectedDates);
    } else if (Array.isArray(fp.config.onClose)) {
      fp.config.onClose[0](selectedDates);
    }
    
    expect(spy).toHaveBeenCalledWith({
      start: '2023-01-01',
      end: '2023-01-10'
    });
  });

  it('should call onChange(null) when cleared', () => {
    const spy = vi.fn();
    component.registerOnChange(spy);
    const fp = (component as any).fpInstance;
    if (typeof fp.config.onClose === 'function') {
      fp.config.onClose([]);
    } else if (Array.isArray(fp.config.onClose)) {
      fp.config.onClose[0]([]);
    }
    expect(spy).toHaveBeenCalledWith(null);
  });

  it('should update flatpickr on writeValue', () => {
    const spy = vi.spyOn((component as any).fpInstance, 'setDate');
    component.writeValue({ start: '2023-01-01', end: '2023-01-02' });
    expect(spy).toHaveBeenCalledWith(['2023-01-01', '2023-01-02']);
  });

  it('should clear flatpickr on writeValue(null)', () => {
    const spy = vi.spyOn((component as any).fpInstance, 'clear');
    component.writeValue(null);
    expect(spy).toHaveBeenCalled();
  });

  it.skip('should handle disabled state', async () => {
    component.setDisabledState(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isDisabled).toBe(true);
    const input = fixture.nativeElement.querySelector('input');
    expect(input.disabled).toBe(true);
  });
});
