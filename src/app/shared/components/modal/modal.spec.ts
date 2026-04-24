import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { vi } from 'vitest';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show content when isOpen is false', () => {
    fixture.componentRef.setInput('isOpen', false);
    fixture.detectChanges();
    const modalContent = fixture.nativeElement.querySelector('.bg-white');
    expect(modalContent).toBeFalsy();
  });

  it('should show content when isOpen is true', () => {
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    const modalContent = fixture.nativeElement.querySelector('.bg-white');
    expect(modalContent).toBeTruthy();
  });

  it('should emit onClose when overlay is clicked', () => {
    const spy = vi.spyOn(component.onClose, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    
    const overlay = fixture.nativeElement.querySelector('.absolute.inset-0');
    overlay.click();
    
    expect(spy).toHaveBeenCalled();
  });

  it('should emit onClose when close button is clicked', () => {
    const spy = vi.spyOn(component.onClose, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    
    const closeBtn = fixture.nativeElement.querySelector('button');
    closeBtn.click();
    
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit onClose when modal content is clicked', () => {
    const spy = vi.spyOn(component.onClose, 'emit');
    fixture.componentRef.setInput('isOpen', true);
    fixture.detectChanges();
    
    const modalContent = fixture.nativeElement.querySelector('.bg-white');
    modalContent.click();
    
    expect(spy).not.toHaveBeenCalled();
  });
});
