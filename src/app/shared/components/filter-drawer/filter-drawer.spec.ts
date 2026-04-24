import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FilterDrawerComponent } from './filter-drawer.component';
import { vi } from 'vitest';

describe('FilterDrawerComponent', () => {
  let component: FilterDrawerComponent;
  let fixture: ComponentFixture<FilterDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterDrawerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show overlay and translated drawer when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    
    const overlay = fixture.nativeElement.querySelector('.fixed.inset-0');
    expect(overlay).toBeTruthy();
    
    const drawer = fixture.nativeElement.querySelector('aside');
    expect(drawer.classList.contains('translate-x-0')).toBe(true);
  });

  it('should hide overlay and apply translate-x-full when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    
    const overlay = fixture.nativeElement.querySelector('.fixed.inset-0');
    expect(overlay).toBeFalsy();
    
    const drawer = fixture.nativeElement.querySelector('aside');
    expect(drawer.classList.contains('translate-x-full')).toBe(true);
  });

  it('should emit onClose when overlay is clicked', () => {
    const spy = vi.spyOn(component.onClose, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    
    const overlay = fixture.nativeElement.querySelector('.fixed.inset-0');
    overlay.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit onClose when close button is clicked', () => {
    const spy = vi.spyOn(component.onClose, 'emit');
    const closeBtn = fixture.nativeElement.querySelector('button');
    closeBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit onApply when aplicar button is clicked', () => {
    const spy = vi.spyOn(component.onApply, 'emit');
    const applyBtn = fixture.nativeElement.querySelectorAll('footer button')[1];
    (applyBtn as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit onClear when limpar button is clicked', () => {
    const spy = vi.spyOn(component.onClear, 'emit');
    const clearBtn = fixture.nativeElement.querySelectorAll('footer button')[0];
    (clearBtn as HTMLButtonElement).click();
    expect(spy).toHaveBeenCalled();
  });
});
