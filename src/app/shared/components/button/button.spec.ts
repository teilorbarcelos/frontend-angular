import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ButtonComponent } from './button.component';
import { vi } from 'vitest';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with correct variant classes', () => {
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('bg-red-600')).toBe(true);
  });

  it('should render with correct size classes', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.classList.contains('px-6')).toBe(true);
  });

  it('should be disabled when disabled input is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.disabled).toBe(true);
  });

  it('should be disabled when loading is true', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.disabled).toBe(true);
  });

  it('should emit onClick event', () => {
    const spy = vi.spyOn(component.onClick, 'emit');
    const btn = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(spy).toHaveBeenCalled();
  });
});
