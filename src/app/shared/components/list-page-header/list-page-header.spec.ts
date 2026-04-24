import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ListPageHeaderComponent } from './list-page-header.component';
import { vi } from 'vitest';
import { By } from '@angular/platform-browser';

describe('ListPageHeaderComponent', () => {
  let component: ListPageHeaderComponent;
  let fixture: ComponentFixture<ListPageHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListPageHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListPageHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.detectChanges();
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toBe('Test Title');
  });

  it('should emit onFilterClick', () => {
    const spy = vi.spyOn(component.onFilterClick, 'emit');
    const filterBtn = fixture.nativeElement.querySelector('app-button button');
    filterBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should show filter count when > 0', () => {
    fixture.componentRef.setInput('filterCount', 5);
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('span');
    expect(badge.textContent).toContain('5');
  });

  it('should show create button when showCreate is true', () => {
    fixture.componentRef.setInput('showCreate', true);
    fixture.componentRef.setInput('createLabel', 'Add New');
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('app-button');
    expect(buttons.length).toBe(2);
    expect(buttons[1].textContent).toContain('Add New');
  });

  it('should emit onCreateClick', () => {
    fixture.componentRef.setInput('showCreate', true);
    fixture.detectChanges();
    const spy = vi.spyOn(component.onCreateClick, 'emit');
    const createBtn = fixture.nativeElement.querySelectorAll('app-button button')[1];
    createBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit onSearch from app-search-input', () => {
    const spy = vi.spyOn(component.onSearch, 'emit');
    const debugElement = fixture.debugElement.query(By.css('app-search-input'));
    debugElement.triggerEventHandler('onSearch', 'test query');
    expect(spy).toHaveBeenCalledWith('test query');
  });
});
