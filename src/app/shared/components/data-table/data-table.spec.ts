import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DataTableComponent, HeaderMapItem } from './data-table.component';
import { vi } from 'vitest';

describe('DataTableComponent', () => {
  let component: DataTableComponent<any>;
  let fixture: ComponentFixture<DataTableComponent<any>>;

  const headerMap: HeaderMapItem<any>[] = [
    { title: 'Name', keyItem: 'name', sortable: true },
    { title: 'Age', keyItem: 'age', sortable: false },
  ];

  const data = [
    { id: '1', name: 'John', age: 30 },
    { id: '2', name: 'Jane', age: 25 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('headerMap', headerMap);
    fixture.componentRef.setInput('data', data);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render headers and data', () => {
    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toContain('Name');

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('John');
  });

  it('should show loading state', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  it('should show empty state when no data', () => {
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nenhum registro encontrado');
  });

  it('should emit onSortChange when clicking sortable header', () => {
    const spy = vi.spyOn(component.onSortChange, 'emit');
    const nameHeader = fixture.nativeElement.querySelectorAll('th')[0];
    
    // First click: asc
    nameHeader.click();
    expect(spy).toHaveBeenCalledWith({ orderBy: 'name', orderDirection: 'asc' });

    // Mock current sorting to test toggle
    fixture.componentRef.setInput('sorting', { orderBy: 'name', orderDirection: 'asc' });
    nameHeader.click();
    expect(spy).toHaveBeenCalledWith({ orderBy: 'name', orderDirection: 'desc' });
  });

  it('should not emit onSortChange when clicking non-sortable header', () => {
    const spy = vi.spyOn(component.onSortChange, 'emit');
    const ageHeader = fixture.nativeElement.querySelectorAll('th')[1];
    ageHeader.click();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit onPageChange when clicking pagination buttons', () => {
    const spy = vi.spyOn(component.onPageChange, 'emit');
    fixture.componentRef.setInput('totalItems', 100);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();

    const nextBtn = fixture.nativeElement.querySelector('button[title="Próximo"]');
    nextBtn.click();
    expect(spy).toHaveBeenCalledWith(2);

    const prevBtn = fixture.nativeElement.querySelector('button[title="Anterior"]');
    prevBtn.click();
    expect(spy).toHaveBeenCalledWith(0);
  });

  it('should calculate page numbers correctly', () => {
    fixture.componentRef.setInput('totalItems', 100);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('currentPage', 5);
    
    const pages = component.pageNumbers;
    expect(pages).toContain(0);
    expect(pages).toContain(9);
    expect(pages).toContain(5);
    expect(pages).toContain('...');
  });

  it('should emit onPageSizeChange when select changes', () => {
    const spy = vi.spyOn(component.onPageSizeChange, 'emit');
    const select = fixture.nativeElement.querySelector('select');
    select.value = '50';
    select.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalledWith(50);
  });
});
