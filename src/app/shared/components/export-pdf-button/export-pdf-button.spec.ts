import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ExportPdfButtonComponent } from './export-pdf-button.component';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('ExportPdfButtonComponent', () => {
  let component: ExportPdfButtonComponent;
  let fixture: ComponentFixture<ExportPdfButtonComponent>;
  let mockOnExport: any;

  const queryParams = {
    searchWord: 'test',
    filters: {},
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock the global DOM APIs used by downloadPdf
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();

    mockOnExport = vi.fn().mockReturnValue(of(new Blob(['pdf'], { type: 'application/pdf' })));

    await TestBed.configureTestingModule({
      imports: [ExportPdfButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportPdfButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('onExport', mockOnExport);
    fixture.componentRef.setInput('queryParams', queryParams);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render with default label', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.textContent.trim()).toBe('Exportar PDF');
  });

  it('should render with custom label', () => {
    fixture.componentRef.setInput('label', 'Download');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.textContent.trim()).toBe('Download');
  });

  it('should trigger onExport and download PDF flow on click successfully', () => {
    const mockClick = vi.fn();
    const mockRemoveChild = vi.fn();

    const dummyLink = {
      href: '',
      setAttribute: vi.fn(),
      click: mockClick,
      parentNode: {
        removeChild: mockRemoveChild,
      },
    };

    const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(dummyLink as any);
    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(dummyLink as any);

    const btn = fixture.nativeElement.querySelector('button');
    btn.click();

    expect(mockOnExport).toHaveBeenCalledWith(queryParams);
    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(component.isExporting).toBe(false);

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
  });

  it('should handle export error gracefully', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(vi.fn());
    mockOnExport.mockReturnValue(throwError(() => new Error('PDF Error')));

    const btn = fixture.nativeElement.querySelector('button');
    btn.click();

    expect(mockOnExport).toHaveBeenCalledWith(queryParams);
    expect(component.isExporting).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
