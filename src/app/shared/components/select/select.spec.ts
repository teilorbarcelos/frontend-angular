import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SelectComponent, SelectOption } from './select.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render options', () => {
    const options: SelectOption[] = [
      { label: 'Option 1', value: '1' },
      { label: 'Option 2', value: '2' },
    ];
    fixture.componentRef.setInput('options', options);
    fixture.detectChanges();
    
    const renderedOptions = fixture.nativeElement.querySelectorAll('option');
    // +1 if placeholder exists
    expect(renderedOptions.length).toBe(2);
    expect(renderedOptions[0].textContent).toBe('Option 1');
  });

  it('should render placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Select an option');
    fixture.detectChanges();
    
    const placeholder = fixture.nativeElement.querySelector('option[value=""]');
    expect(placeholder.textContent).toBe('Select an option');
  });

  it('should show error message', () => {
    fixture.componentRef.setInput('error', 'Select is required');
    fixture.detectChanges();
    
    const error = fixture.nativeElement.querySelector('p');
    expect(error.textContent).toContain('Select is required');
  });

  it('should update control value when writeValue is called', () => {
    component.writeValue('2');
    expect(component.control.value).toBe('2');
  });

  it('should handle disabled state', () => {
    component.setDisabledState(true);
    expect(component.control.disabled).toBe(true);
    
    component.setDisabledState(false);
    expect(component.control.enabled).toBe(true);
  });
});
