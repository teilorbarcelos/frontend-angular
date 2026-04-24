import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActionMenuPortalComponent } from './action-menu-portal.component';
import { ActionMenuService } from '../../../core/services/action-menu.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('ActionMenuPortalComponent', () => {
  let component: ActionMenuPortalComponent;
  let fixture: ComponentFixture<ActionMenuPortalComponent>;
  let mockService: any;
  let stateSignal: any;

  beforeEach(async () => {
    stateSignal = signal(null);
    mockService = {
      state: stateSignal,
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ActionMenuPortalComponent],
      providers: [
        { provide: ActionMenuService, useValue: mockService }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionMenuPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render anything when state is null', () => {
    const portal = fixture.nativeElement.querySelector('.action-menu-portal');
    expect(portal).toBeFalsy();
  });

  it('should render menu when state is provided', () => {
    stateSignal.set({
      template: null,
      context: null,
      position: { top: 100, left: 100, width: 200, upwards: false }
    });
    fixture.detectChanges();
    
    const portal = fixture.nativeElement.querySelector('.action-menu-portal');
    expect(portal).toBeTruthy();
    expect(portal.style.top).toBe('104px');
    expect(portal.style.left).toBe('100px');
  });

  it('should render upwards when position.upwards is true', () => {
    // Mock viewport height
    vi.spyOn(component, 'viewportHeight', 'get').mockReturnValue(1000);
    
    stateSignal.set({
      template: null,
      context: null,
      position: { top: 500, left: 100, width: 200, upwards: true }
    });
    fixture.detectChanges();
    
    const portal = fixture.nativeElement.querySelector('.action-menu-portal');
    // bottom should be 1000 - 500 + 4 = 504
    expect(portal.style.bottom).toBe('504px');
  });

  it('should call close when overlay is clicked', () => {
    stateSignal.set({
      template: null,
      context: null,
      position: { top: 100, left: 100, width: 200, upwards: false }
    });
    fixture.detectChanges();
    
    const overlay = fixture.nativeElement.querySelector('.fixed.inset-0');
    overlay.click();
    expect(mockService.close).toHaveBeenCalled();
  });

  it('should call close and prevent default on right click', () => {
    stateSignal.set({
      template: null,
      context: null,
      position: { top: 100, left: 100, width: 200, upwards: false }
    });
    fixture.detectChanges();
    
    const overlay = fixture.nativeElement.querySelector('.fixed.inset-0');
    const event = new MouseEvent('contextmenu', { cancelable: true });
    const spy = vi.spyOn(event, 'preventDefault');
    overlay.dispatchEvent(event);
    
    expect(mockService.close).toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
  });

  it('should close on window scroll/resize', () => {
    window.dispatchEvent(new Event('scroll'));
    expect(mockService.close).toHaveBeenCalled();
    
    window.dispatchEvent(new Event('resize'));
    expect(mockService.close).toHaveBeenCalledTimes(2);
  });

  it('should return real window.innerHeight for viewportHeight', () => {
    expect(component.viewportHeight).toBe(window.innerHeight);
  });
});
