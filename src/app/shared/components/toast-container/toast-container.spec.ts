import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from '../../../core/services/toast.service';
import { signal } from '@angular/core';

describe('ToastContainerComponent', () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;
  let mockToastService: any;

  beforeEach(async () => {
    mockToastService = {
      toasts: signal([]),
      remove: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
      providers: [
        { provide: ToastService, useValue: mockToastService }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render toasts', () => {
    mockToastService.toasts.set([
      { id: '1', message: 'Success Toast', type: 'success', duration: 3000 },
      { id: '2', message: 'Error Toast', type: 'error', duration: 3000 },
    ]);
    fixture.detectChanges();
    
    const toasts = fixture.nativeElement.querySelectorAll('.rounded-xl');
    expect(toasts.length).toBe(2);
    expect(toasts[0].textContent).toContain('Success Toast');
    expect(toasts[1].textContent).toContain('Error Toast');
  });

  it('should call toastService.remove when close button is clicked', () => {
    mockToastService.toasts.set([
      { id: '1', message: 'Success Toast', type: 'success', duration: 3000 }
    ]);
    fixture.detectChanges();
    
    const closeBtn = fixture.nativeElement.querySelector('button');
    closeBtn.click();
    
    expect(mockToastService.remove).toHaveBeenCalledWith('1');
  });

  it('should show progress bar when duration is provided', () => {
    mockToastService.toasts.set([
      { id: '1', message: 'Timed Toast', type: 'success', duration: 3000 }
    ]);
    fixture.detectChanges();
    
    const progressBar = fixture.nativeElement.querySelector('.animate-progress');
    expect(progressBar).toBeTruthy();
    expect(progressBar.style.animationDuration).toBe('3000ms');
  });

  it('should get correct icon based on type', () => {
    expect(component.getIcon('success')).toBeTruthy();
    expect(component.getIcon('error')).toBeTruthy();
    expect(component.getIcon('warning')).toBeTruthy();
    expect(component.getIcon('info')).toBeTruthy();
  });
});
