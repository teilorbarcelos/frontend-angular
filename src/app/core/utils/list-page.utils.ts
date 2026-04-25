import { inject, signal, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { TableSort } from '../../shared/components/data-table/data-table.component';

export interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface FetchParams {
  page: number;
  size: number;
  searchWord: string;
  searchFields: string[];
  filters: Record<string, any>;
  sort: TableSort;
  all?: boolean;
}

export interface ListPageConfig<T> {
  feature: string;
  searchFields: string[];
  defaultSort?: TableSort;
  baseRoute: string;
  fetch: (params: FetchParams) => Observable<ListResponse<T>>;
  toggleStatus?: (id: string, active: boolean) => Observable<any>;
  delete?: (id: string) => Observable<any>;
  messages?: {
    toggleSuccess?: (active: boolean) => string;
    toggleError?: string;
    deleteSuccess?: string;
    deleteError?: string;
    loadError?: string;
  };
}

export function createListPageController<T>(config: ListPageConfig<T>) {
  const router = inject(Router);
  const toastService = inject(ToastService);

  const items = signal<T[]>([]);
  const totalItems = signal(0);
  const isLoading = signal(false);
  const isFilterOpen = signal(false);

  const page = signal(0);
  const size = signal(25);
  const searchWord = signal('');
  const filters = signal<Record<string, any>>({});
  const sort = signal<TableSort>(config.defaultSort || { orderBy: 'name', orderDirection: 'asc' });

  const filterCount = computed(() => Object.keys(filters()).length);

  async function loadItems() {
    isLoading.set(true);
    try {
      const res = await firstValueFrom(
        config.fetch({
          page: page(),
          size: size(),
          searchWord: searchWord(),
          searchFields: config.searchFields,
          filters: filters(),
          sort: sort(),
          all: true
        })
      );
      items.set(res.items);
      totalItems.set(res.total);
    } catch (error) {
      console.error(`Error loading ${config.feature}s`, error);
      toastService.error(config.messages?.loadError || `Erro ao carregar a listagem de ${config.feature}s.`);
    } finally {
      isLoading.set(false);
    }
  }

  // Effect to reload when search/filter/page/size/sort changes
  effect(() => {
    loadItems();
  });

  function handleSearch(word: string) {
    searchWord.set(word);
    page.set(0);
  }

  function handleFilter(f: Record<string, any>) {
    filters.set(f);
    page.set(0);
  }

  function handlePageChange(p: number) {
    page.set(p);
  }

  function handlePageSizeChange(s: number) {
    size.set(s);
    page.set(0);
  }

  function handleSortChange(s: TableSort) {
    sort.set(s);
  }

  function toggleFilter() {
    isFilterOpen.update(v => !v);
  }

  function navigateToCreate() {
    router.navigate([`${config.baseRoute}/new`]);
  }

  function navigateToEdit(id: string) {
    router.navigate([`${config.baseRoute}/update`, id]);
  }

  async function toggleStatus(id: string, active: boolean) {
    if (!config.toggleStatus) return;
    try {
      await firstValueFrom(config.toggleStatus(id, active));
      toastService.success(
        config.messages?.toggleSuccess?.(active) || 
        `${config.feature.charAt(0).toUpperCase() + config.feature.slice(1)} ${active ? 'ativado' : 'desativado'} com sucesso!`
      );
      loadItems();
    } catch (error) {
      console.error(`Error toggling status for ${config.feature}`, error);
      toastService.error(config.messages?.toggleError || `Erro ao alterar o status do ${config.feature}.`);
    }
  }

  async function deleteItem(id: string) {
    if (!config.delete) return;
    try {
      await firstValueFrom(config.delete(id));
      toastService.success(config.messages?.deleteSuccess || `${config.feature.charAt(0).toUpperCase() + config.feature.slice(1)} excluído com sucesso!`);
      loadItems();
    } catch (error) {
      console.error(`Error deleting ${config.feature}`, error);
      toastService.error(config.messages?.deleteError || `Erro ao excluir o ${config.feature}.`);
    }
  }

  return {
    items,
    totalItems,
    isLoading,
    isFilterOpen,
    page,
    size,
    searchWord,
    filters,
    sort,
    filterCount,
    handleSearch,
    handleFilter,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    toggleFilter,
    navigateToCreate,
    navigateToEdit,
    toggleStatus,
    deleteItem,
    loadItems
  };
}
