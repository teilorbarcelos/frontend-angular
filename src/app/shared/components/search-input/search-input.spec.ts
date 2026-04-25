import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SearchInputComponent } from './search-input.component';
import { ReactiveFormsModule } from '@angular/forms';
import { vi } from 'vitest';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit searched after debounceTime', () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(component.searched, 'emit');
    component.searchControl.setValue('test');

    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledWith('test');
    vi.useRealTimers();
  });

  it('should not emit if value is same', () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(component.searched, 'emit');
    component.searchControl.setValue('test');
    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledTimes(1);

    component.searchControl.setValue('test');
    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('should emit empty string when cleared', () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(component.searched, 'emit');
    component.searchControl.setValue('test');
    vi.advanceTimersByTime(300);

    component.searchControl.setValue(null);
    vi.advanceTimersByTime(300);
    expect(spy).toHaveBeenCalledWith('');
    vi.useRealTimers();
  });
});
