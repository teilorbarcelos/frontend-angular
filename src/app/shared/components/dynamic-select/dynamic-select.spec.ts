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
    
    expect(component.state().selectedItems.length).toBe(2);
    expect(component.isOpen()).toBe(true);
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

  it('should handle writeValue', async () => {
    component.writeValue('1');
    expect(fetchByIdsMock).toHaveBeenCalledWith(['1']);
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
});
