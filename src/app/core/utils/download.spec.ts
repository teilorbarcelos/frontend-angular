import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { downloadPdf } from './download';

describe('downloadPdf', () => {
  beforeEach(() => {
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create a link element, set download properties, trigger click, and cleanup', () => {
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

    const blob = new Blob(['pdf-content'], { type: 'application/pdf' });
    const filename = 'test-report.pdf';

    downloadPdf(blob, filename);

    expect(window.URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(dummyLink.href).toBe('blob:mock-url');
    expect(dummyLink.setAttribute).toHaveBeenCalledWith('download', filename);
    expect(appendChildSpy).toHaveBeenCalledWith(dummyLink);
    expect(mockClick).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(dummyLink);
    expect(window.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('should handle missing parentNode gracefully', () => {
    const dummyLink = {
      href: '',
      setAttribute: vi.fn(),
      click: vi.fn(),
      parentNode: null,
    };

    vi.spyOn(document, 'createElement').mockReturnValue(dummyLink as any);
    vi.spyOn(document.body, 'appendChild').mockReturnValue(dummyLink as any);

    const blob = new Blob(['pdf-content'], { type: 'application/pdf' });
    downloadPdf(blob, 'test.pdf');

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(window.URL.revokeObjectURL).toHaveBeenCalled();
  });
});
