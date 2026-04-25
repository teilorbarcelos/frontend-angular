import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { vi } from 'vitest';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a toast and remove it after duration', () => {
    service.show('Test message', 'success', 3000);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Test message');

    vi.advanceTimersByTime(3000);
    // After 3000ms, remove is called. 
    // remove() sets isClosing=true and starts another 300ms timer.
    expect(service.toasts()[0].isClosing).toBe(true);

    vi.advanceTimersByTime(300);
    expect(service.toasts().length).toBe(0);
  });

  it('should have helper methods for each type', () => {
    service.success('Success');
    expect(service.toasts()[0].type).toBe('success');
    
    service.error('Error');
    expect(service.toasts()[1].type).toBe('error');
    
    service.info('Info');
    expect(service.toasts()[2].type).toBe('info');
    
    service.warning('Warning');
    expect(service.toasts()[3].type).toBe('warning');
  });

  it('should not remove automatically if duration is 0', () => {
    service.show('Permanent', 'info', 0);
    vi.advanceTimersByTime(10000);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].isClosing).toBe(false);
  });

  it('should handle remove for non-existent id', () => {
    service.success('Existent');
    const existingId = service.toasts()[0].id;
    service.remove(999); // Non-existent
    
    // Should still have the existent toast and it should NOT be closing
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].isClosing).toBe(false);
    
    vi.advanceTimersByTime(300);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].id).toBe(existingId);
  });
});
