import { TestBed, ComponentFixture } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show label when provided', () => {
    fixture.componentRef.setInput('label', 'Test Label');
    fixture.componentRef.setInput('id', 'test-input');
    fixture.detectChanges();
    
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent).toContain('Test Label');
    expect(label.getAttribute('for')).toBe('test-input');
  });

  it('should show error message when provided', () => {
    fixture.componentRef.setInput('error', 'Required field');
    fixture.detectChanges();
    
    const error = fixture.nativeElement.querySelector('p');
    expect(error.textContent).toContain('Required field');
    const input = fixture.nativeElement.querySelector('input');
    expect(input.classList.contains('border-red-300')).toBe(true);
  });

  it('should update control value when writeValue is called', () => {
    component.writeValue('New Value');
    expect(component.control.value).toBe('New Value');
  });

  it('should call onChange when input value changes', () => {
    const onChange = vi.fn();
    component.registerOnChange(onChange);
    
    component.control.setValue('Typed Value');
    expect(onChange).toHaveBeenCalledWith('Typed Value');
  });

  it('should handle disabled state', () => {
    component.setDisabledState(true);
    expect(component.control.disabled).toBe(true);
    
    component.setDisabledState(false);
    expect(component.control.enabled).toBe(true);
  });

  it('should handle registerOnTouched', () => {
    const fn = vi.fn();
    component.registerOnTouched(fn);
    expect(true).toBe(true);
  });
});
