import { TestBed } from '@angular/core/testing';
import { ActionMenuService } from './action-menu.service';
import { vi } from 'vitest';

describe('ActionMenuService', () => {
  let service: ActionMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActionMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open menu with correct positioning', () => {
    const mockTrigger = {
      getBoundingClientRect: () => ({
        top: 100,
        bottom: 140,
        left: 500,
        right: 700,
        width: 200,
        height: 40,
      }),
    } as HTMLElement;

    // Mock window height
    vi.stubGlobal('innerHeight', 1000);

    service.open({} as any, { id: 1 }, mockTrigger);
    
    const state = service.state();
    expect(state).toBeTruthy();
    expect(state?.context).toEqual({ id: 1 });
    expect(state?.position.upwards).toBe(false); // 1000 - 140 = 860 > 200
    expect(state?.position.top).toBe(140);
  });

  it('should open upwards if space below is limited', () => {
    const mockTrigger = {
      getBoundingClientRect: () => ({
        top: 800,
        bottom: 840,
        left: 500,
        right: 700,
        width: 200,
        height: 40,
      }),
    } as HTMLElement;

    vi.stubGlobal('innerHeight', 1000);

    service.open({} as any, {}, mockTrigger);
    
    const state = service.state();
    expect(state?.position.upwards).toBe(true); // 1000 - 840 = 160 < 200
    expect(state?.position.top).toBe(800);
  });

  it('should close menu', () => {
    service.state.set({} as any);
    service.close();
    expect(service.state()).toBeNull();
  });
});
