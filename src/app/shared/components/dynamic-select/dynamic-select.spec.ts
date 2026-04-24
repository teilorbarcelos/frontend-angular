import { TestBed, ComponentFixture, fakeAsync, tick, flush, discardPeriodicTasks } from '@angular/core/testing';
import { DynamicSelectComponent } from './dynamic-select.component';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';

describe('DynamicSelectComponent', () => {
  let component: DynamicSelectComponent<any>;
  let fixture: ComponentFixture<DynamicSelectComponent<any>>;

  const mockItems = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ];

  const fetchPageMock = vi.fn().mockResolvedValue({ items: mockItems, hasMore: false });
  const fetchByIdsMock = vi.fn().mockResolvedValue([]);
  const getOptionLabel = (item: any) => item.name;
  const getOptionValue = (item: any) => item.id;

  beforeEach(async () => {
    // Mock IntersectionObserver
    const mockIntersectionObserver = vi.fn();
    mockIntersectionObserver.prototype.observe = vi.fn();
    mockIntersectionObserver.prototype.unobserve = vi.fn();
    mockIntersectionObserver.prototype.disconnect = vi.fn();
    vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);

    await TestBed.configureTestingModule({
      imports: [DynamicSelectComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicSelectComponent);
    component = fixture.componentInstance;
    
    // Set required inputs
    component.fetchPage = fetchPageMock;
    component.fetchByIds = fetchByIdsMock;
    component.getOptionLabel = getOptionLabel;
    component.getOptionValue = getOptionValue;
    
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    (component as any) = null;
    (fixture as any) = null;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open dropdown and trigger initial load', async () => {
    component.toggleOpen();
    fixture.detectChanges();
    
    expect(component.isOpen()).toBe(true);
    await fixture.whenStable();
    fixture.detectChanges();
    
    expect(fetchPageMock).toHaveBeenCalled();
  });

  it('should display selected item label', async () => {
    component.state.set({
      ...component.state(),
      selectedItems: [mockItems[0]]
    });
    fixture.detectChanges();
    await fixture.whenStable();
    
    const display = component.displayValue();
    expect(display).toBe('Item 1');
  });

  it('should handle selection in single mode', async () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);
    component.multiple = false;
    
    component.handleSelect(mockItems[0]);
    fixture.detectChanges();
    
    expect(onChangeSpy).toHaveBeenCalledWith('1');
    expect(component.isOpen()).toBe(false);
  });

  it('should handle selection in multiple mode', async () => {
    const onChangeSpy = vi.fn();
    component.registerOnChange(onChangeSpy);
    component.multiple = true;
    
    component.handleSelect(mockItems[0]);
    fixture.detectChanges();
    
    expect(onChangeSpy).toHaveBeenCalled();
  });

  it('should filter items on search', async () => {
    component.toggleOpen();
    fixture.detectChanges();
    
    component.searchControl.setValue('test');
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component.state().search).toBe('test');
  });

  it('should close on outside click', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    
    document.dispatchEvent(new MouseEvent('click'));
    expect(component.isOpen()).toBe(false);
  });

  it('should write value to engine', () => {
    const spy = vi.spyOn((component as any).engine, 'setValue');
    component.writeValue('1');
    expect(spy).toHaveBeenCalledWith(['1']);
  });
});
