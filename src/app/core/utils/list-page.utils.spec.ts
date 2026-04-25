import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { createListPageController, ListPageConfig } from './list-page.utils';
import { ToastService } from '../services/toast.service';
import { vi } from 'vitest';

describe('ListPageUtils', () => {
  let mockRouter: any;
  let mockToastService: any;
  let config: ListPageConfig<any>;

  beforeEach(() => {
    mockRouter = { navigate: vi.fn() };
    mockToastService = { success: vi.fn(), error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToastService },
      ]
    });

    config = {
      feature: 'test',
      baseRoute: '/test',
      searchFields: ['name'],
      fetch: vi.fn().mockReturnValue(of({ items: [], total: 0 })),
      toggleStatus: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of({})),
    };
  });

  it('should initialize signals with default values when no defaultSort provided', () => {
    delete config.defaultSort;
    TestBed.runInInjectionContext(() => {
      const ctrl = createListPageController(config);
      expect(ctrl.sort()).toEqual({ orderBy: 'name', orderDirection: 'asc' });
    });
  });

  it('should initialize signals with default values', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createListPageController(config);
      expect(ctrl.page()).toBe(0);
      expect(ctrl.size()).toBe(25);
      expect(ctrl.searchWord()).toBe('');
      expect(ctrl.sort()).toEqual({ orderBy: 'name', orderDirection: 'asc' });
    });
  });

  it('should handle search', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createListPageController(config);
      ctrl.handleSearch('query');
      expect(ctrl.searchWord()).toBe('query');
      expect(ctrl.page()).toBe(0);
    });
  });

  it('should handle filter', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createListPageController(config);
      ctrl.handleFilter({ category: 'cat1' });
      expect(ctrl.filters()).toEqual({ category: 'cat1' });
      expect(ctrl.filterCount()).toBe(1);
    });
  });

  it('should handle page and size changes', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createListPageController(config);
      ctrl.handlePageChange(2);
      expect(ctrl.page()).toBe(2);

      ctrl.handlePageSizeChange(50);
      expect(ctrl.size()).toBe(50);
      expect(ctrl.page()).toBe(0);
    });
  });

  it('should handle sort changes', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createListPageController(config);
      ctrl.handleSortChange({ orderBy: 'sku', orderDirection: 'desc' });
      expect(ctrl.sort()).toEqual({ orderBy: 'sku', orderDirection: 'desc' });
    });
  });

  it('should navigate to create and edit', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createListPageController(config);
      ctrl.navigateToCreate();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/new']);

      ctrl.navigateToEdit('123');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test/update', '123']);
    });
  });

  it('should toggle filter state', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createListPageController(config);
      expect(ctrl.isFilterOpen()).toBe(false);
      ctrl.toggleFilter();
      expect(ctrl.isFilterOpen()).toBe(true);
    });
  });

  it('should call toggleStatus and reload items', async () => {
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createListPageController(config);
      // Reset fetch mock because it's called on init by effect
      (config.fetch as any).mockClear();
      await ctrl.toggleStatus('123', true);
      expect(config.toggleStatus).toHaveBeenCalledWith('123', true);
      expect(mockToastService.success).toHaveBeenCalled();
      expect(config.fetch).toHaveBeenCalled();
    });
  });

  it('should handle toggleStatus error', async () => {
    config.toggleStatus = vi.fn().mockReturnValue(throwError(() => new Error('Error')));
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createListPageController(config);
      await ctrl.toggleStatus('123', true);
      expect(mockToastService.error).toHaveBeenCalled();
    });
  });

  it('should return early if toggleStatus is not provided', async () => {
    delete config.toggleStatus;
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createListPageController(config);
      await ctrl.toggleStatus('123', true);
      expect(mockToastService.success).not.toHaveBeenCalled();
    });
  });

  it('should call deleteItem and reload items', async () => {
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createListPageController(config);
      (config.fetch as any).mockClear();
      await ctrl.deleteItem('123');
      expect(config.delete).toHaveBeenCalledWith('123');
      expect(mockToastService.success).toHaveBeenCalled();
      expect(config.fetch).toHaveBeenCalled();
    });
  });

  it('should handle delete error', async () => {
    config.delete = vi.fn().mockReturnValue(throwError(() => new Error('Error')));
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createListPageController(config);
      await ctrl.deleteItem('123');
      expect(mockToastService.error).toHaveBeenCalled();
    });
  });

  it('should return early if delete is not provided', async () => {
    delete config.delete;
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createListPageController(config);
      await ctrl.deleteItem('123');
      expect(mockToastService.success).not.toHaveBeenCalled();
    });
  });

  it('should handle load items error', async () => {
    config.fetch = vi.fn().mockReturnValue(throwError(() => new Error('Error')));
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createListPageController(config);
      await ctrl.loadItems();
      expect(mockToastService.error).toHaveBeenCalled();
    });
  });
});
