import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DynamicSelectComponent } from './dynamic-select.component';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
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

    // Clear mocks
    fetchPageMock.mockClear();
    fetchByIdsMock.mockClear();

    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle dropdown', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);
    button.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should open dropdown and trigger initial load', async () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
    
    expect(component.isOpen()).toBe(true);
    expect(fetchPageMock).toHaveBeenCalled();
  });

  it('should select an option', async () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();

    const option = fixture.debugElement.query(By.css('.cursor-pointer'));
    option.nativeElement.click();
    
    expect(component.hasSelected()).toBe(true);
    expect(component.isOpen()).toBe(false);
  });

  it('should handle search', async () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    
    const input = fixture.debugElement.query(By.css('input'));
    input.nativeElement.value = 'test';
    input.nativeElement.dispatchEvent(new Event('input'));
    
    // The search is handled by searchControl.valueChanges in the component
    // which calls engine.setSearch
    expect(component.isOpen()).toBe(true);
  });

  it('should handle multiple selection', async () => {
    component.multiple = true;
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();

    const options = fixture.debugElement.queryAll(By.css('.cursor-pointer'));
    expect(options.length).toBeGreaterThan(0);
    options[0].nativeElement.click();
    options[1].nativeElement.click();
    fixture.detectChanges();
    
    expect(component.state().selectedItems.length).toBe(2);
    expect(component.isOpen()).toBe(true);

    // Verify multiple selection tags are rendered (Lines 110-123)
    const tags = fixture.nativeElement.querySelectorAll('.bg-indigo-50.text-indigo-700');
    expect(tags.length).toBe(2);
  });

  it('should close on outside click', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    expect(component.isOpen()).toBe(true);

    document.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);
  });

  it('should handle disabled state', () => {
    component.setDisabledState(true);
    expect(component.isDisabled()).toBe(true);
    
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.isOpen()).toBe(false);
  });

  it('should handle search with null value', async () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    
    component.searchControl.setValue(null);
    expect(component.isOpen()).toBe(true);
  });

  it('should handle writeValue with single value', async () => {
    component.writeValue('1');
    expect(fetchByIdsMock).toHaveBeenCalledWith(['1']);
  });

  it('should handle writeValue with array', async () => {
    component.writeValue(['1', '2']);
    expect(fetchByIdsMock).toHaveBeenCalledWith(['1', '2']);
  });

  it('should handle writeValue with null', async () => {
    component.writeValue(null);
    expect(fetchByIdsMock).not.toHaveBeenCalled();
  });

  it('should handle writeValue when engine is not defined', () => {
    const originalEngine = (component as any).engine;
    (component as any).engine = undefined;
    expect(() => component.writeValue('1')).not.toThrow();
    (component as any).engine = originalEngine;
  });

  it('should handle registerOnChange', () => {
    const fn = vi.fn();
    component.registerOnChange(fn);
    component.handleSelect(mockItems[0]);
    expect(fn).toHaveBeenCalled();
  });

  it('should handle registerOnTouched', () => {
    const fn = vi.fn();
    component.registerOnTouched(fn);
    component.toggleOpen();
    component.toggleOpen(); // close it
    expect(fn).toHaveBeenCalled();
  });

  it('should return correct display value', () => {
    component.state.set({
      ...component.state(),
      selectedItems: [mockItems[0]]
    });
    expect(component.displayValue()).toBe('Item 1');
  });

  it('should return placeholder when no selection', () => {
    component.placeholder = 'Select...';
    expect(component.displayValue()).toBe('Select...');
  });

  it('should show label and loading state', () => {
    component.label = 'Test Label';
    component.state.set({ ...component.state(), isLoading: true });
    fixture.detectChanges();
    
    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent).toContain('Test Label');
    
    component.toggleOpen();
    fixture.detectChanges();
    const loading = fixture.nativeElement.querySelector('.animate-spin');
    expect(loading).toBeTruthy();
  });

  it('should handle multiple display value', () => {
    component.multiple = true;
    component.state.set({
      ...component.state(),
      selectedItems: [mockItems[0], mockItems[1]]
    });
    expect(component.displayValue()).toBe('2 selecionados');
  });

  it('should render check icon when item is selected', async () => {
    // 1. Open dropdown and wait for load
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();

    // 2. Select first item
    const option = fixture.debugElement.query(By.css('.cursor-pointer'));
    option.nativeElement.click();
    fixture.detectChanges();
    
    // 3. Re-open to check icon
    button.click();
    fixture.detectChanges();
    
    // Check if the check icon is present in the dropdown for the selected item
    const selectedItem = fixture.nativeElement.querySelector('.bg-indigo-50');
    expect(selectedItem).toBeTruthy();
    const checkIcon = selectedItem.querySelector('lucide-angular');
    expect(checkIcon).toBeTruthy();
  });

  it('should handle handleRemove in multiple mode', () => {
    const spy = vi.spyOn(component, 'onChange');
    component.multiple = true;
    component.state.set({
      ...component.state(),
      selectedItems: [mockItems[0]]
    });
    fixture.detectChanges();

    const removeBtn = fixture.nativeElement.querySelector('button.rounded-full');
    removeBtn.click();
    
    expect(spy).toHaveBeenCalled();
  });

  it('should display error message when provided', () => {
    // Reset component to set input before first detectChanges
    fixture = TestBed.createComponent(DynamicSelectComponent);
    component = fixture.componentInstance;
    component.fetchPage = fetchPageMock;
    component.fetchByIds = fetchByIdsMock;
    component.getOptionLabel = getOptionLabel;
    component.getOptionValue = getOptionValue;
    
    component.error = 'Invalid field';
    fixture.detectChanges();
    const errorMsg = fixture.nativeElement.querySelector('p.text-red-500');
    expect(errorMsg.textContent).toContain('Invalid field');
  });

  it('should cleanup observer on destroy', () => {
    component.isOpen.set(true);
    fixture.detectChanges();
    const disconnectSpy = vi.spyOn((component as any).observer, 'disconnect');
    
    component.ngOnDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
    expect((component as any).observer).toBeUndefined();
  });
});
