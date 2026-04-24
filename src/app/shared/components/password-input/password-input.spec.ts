import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PasswordInputComponent } from './password-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';

describe('PasswordInputComponent', () => {
  let component: PasswordInputComponent;
  let fixture: ComponentFixture<PasswordInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordInputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle password visibility', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input.type).toBe('password');
    
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    
    expect(input.type).toBe('text');
    expect(component.showPassword()).toBe(true);
    
    button.click();
    fixture.detectChanges();
    expect(input.type).toBe('password');
  });

  it('should render label and error', () => {
    fixture.componentRef.setInput('label', 'Password');
    fixture.componentRef.setInput('error', 'Wrong password');
    fixture.detectChanges();
    
    expect(fixture.nativeElement.textContent).toContain('Password');
    expect(fixture.nativeElement.textContent).toContain('Wrong password');
  });

  it('should integrate with ControlValueAccessor', () => {
    component.writeValue('secret');
    expect(component.control.value).toBe('secret');

    const spy = vi.fn();
    component.registerOnChange(spy);
    component.control.setValue('new-secret');
    expect(spy).toHaveBeenCalledWith('new-secret');
  });

  it('should handle disabled state', () => {
    component.setDisabledState(true);
    expect(component.control.disabled).toBe(true);
    
    component.setDisabledState(false);
    expect(component.control.enabled).toBe(true);
  });
});
