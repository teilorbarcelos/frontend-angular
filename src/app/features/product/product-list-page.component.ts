import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductService, Product, ProductResponse } from './product.service';
import { AuthService } from '../../core/services/auth.service';
import { ListPageHeaderComponent } from '../../shared/components/list-page-header/list-page-header.component';
import { DataTableComponent, HeaderMapItem, TableSort } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DataTableActionsComponent } from '../../shared/components/data-table-actions/data-table-actions.component';
import { ToastService } from '../../core/services/toast.service';
import { PRODUCT_SEARCHABLE_FIELDS } from './constants/product.constants';
import { firstValueFrom } from 'rxjs';

import { ProductFiltersComponent } from './components/product-filters.component';

@Component({
  selector: 'app-product-list-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ListPageHeaderComponent, 
    DataTableComponent, 
    StatusBadgeComponent, 
    DataTableActionsComponent,
    ProductFiltersComponent
  ],
  host: {
    class: 'flex-1 flex flex-col min-h-0'
  },
  template: `
    <app-list-page-header
      title="Produtos"
      [showCreate]="permissions().canCreate"
      createLabel="Novo Produto"
      (onSearch)="handleSearch($event)"
      (onFilterClick)="toggleFilter()"
      [filterCount]="filterCount()"
      (onCreateClick)="navigateToCreate()"
      class="shrink-0"
    ></app-list-page-header>

    <app-product-filters
      [isOpen]="isFilterOpen()"
      [initialValues]="filters()"
      (onClose)="toggleFilter()"
      (onFilter)="handleFilter($event)"
    ></app-product-filters>

    <app-data-table
      [data]="products()"
      [headerMap]="columns"
      [isLoading]="isLoading()"
      [totalItems]="totalItems()"
      [currentPage]="page()"
      [pageSize]="size()"
      [sorting]="sort()"
      (onPageChange)="handlePageChange($event)"
      (onPageSizeChange)="handlePageSizeChange($event)"
      (onSortChange)="handleSortChange($event)"
    >
      <ng-template #cellTemplate let-item let-column="column" let-value="value">
        @if (column.keyItem === 'active') {
          <app-status-badge 
            [active]="!!value" 
            feature="product" 
            (onClick)="toggleStatus(item.id, !item.active)"
          ></app-status-badge>
        } @else if (column.keyItem === 'id') {
          <app-data-table-actions 
            [id]="item.id" 
            [showEdit]="permissions().canUpdate"
            [showDelete]="permissions().canDelete"
            (onEdit)="navigateToEdit($event)" 
            (onDelete)="deleteProduct($event)"
            deleteMessage="Tem certeza que deseja excluir este produto?"
          ></app-data-table-actions>
        } @else if (column.keyItem === 'price') {
          $ {{ value != null ? value.toFixed(2) : '0.00' }}
        } @else {
           <div [class.truncate]="column.truncate" [class.max-w-xs]="column.truncate">
             {{ value }}
           </div>
        }
      </ng-template>
    </app-data-table>
  `,
})
export class ProductListPageComponent {
  private productService: ProductService = inject(ProductService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private toastService: ToastService = inject(ToastService);

  products = signal<Product[]>([]);
  totalItems = signal(0);
  isLoading = signal(false);
  isFilterOpen = signal(false);

  page = signal(0);
  size = signal(25);
  searchWord = signal('');
  filters = signal<Record<string, any>>({});
  sort = signal<TableSort>({ orderBy: 'name', orderDirection: 'asc' });

  filterCount = computed(() => Object.keys(this.filters()).length);
  
  permissions = computed(() => ({
    canCreate: this.authService.hasPermission('product', 'create'),
    canUpdate: this.authService.hasPermission('product', 'create'), // Mantendo create pois o backend pode estar configurado assim
    canDelete: this.authService.hasPermission('product', 'delete'),
  }));

  columns: HeaderMapItem<Product>[] = [
    { title: 'Nome', keyItem: 'name', truncate: true, sortable: true },
    { title: 'SKU', keyItem: 'sku', truncate: true, sortable: true },
    { title: 'Categoria', keyItem: 'category', truncate: true, sortable: true },
    { title: 'Preço', keyItem: 'price', sortable: true },
    { title: 'Estoque', keyItem: 'stock', sortable: true },
    { title: 'Status', keyItem: 'active', sortable: true },
    { title: '', keyItem: 'id' },
  ];

  constructor() {
    effect(() => {
      this.loadProducts();
    });
  }

  async loadProducts() {
    this.isLoading.set(true);
    try {
      const res: ProductResponse = await firstValueFrom(
        this.productService.getProducts({
          page: this.page(),
          size: this.size(),
          searchWord: this.searchWord(),
          searchFields: PRODUCT_SEARCHABLE_FIELDS,
          filters: this.filters(),
          sort: this.sort(),
          all: true
        })
      );
      this.products.set(res.items);
      this.totalItems.set(res.total);
    } catch (error) {
      console.error('Error loading products', error);
      this.toastService.error('Erro ao carregar a listagem de produtos.');
    } finally {
      this.isLoading.set(false);
    }
  }

  handleSearch(word: string) {
    this.searchWord.set(word);
    this.page.set(0);
  }

  handleFilter(f: Record<string, any>) {
    this.filters.set(f);
    this.page.set(0);
  }

  handlePageChange(p: number) {
    this.page.set(p);
  }

  handlePageSizeChange(s: number) {
    this.size.set(s);
    this.page.set(0);
  }

  handleSortChange(s: TableSort) {
    this.sort.set(s);
  }

  toggleFilter() {
    this.isFilterOpen.update(v => !v);
  }

  navigateToCreate() {
    this.router.navigate(['/products/new']);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/products/update', id]);
  }

  async toggleStatus(id: string, active: boolean) {
    try {
      await firstValueFrom(this.productService.toggleStatus(id, active));
      this.toastService.success(`Produto ${active ? 'ativado' : 'desativado'} com sucesso!`);
      this.loadProducts();
    } catch (error) {
      console.error('Error toggling status', error);
      this.toastService.error('Erro ao alterar o status do produto.');
    }
  }

  async deleteProduct(id: string) {
    try {
      await firstValueFrom(this.productService.deleteProduct(id));
      this.toastService.success('Produto excluído com sucesso!');
      this.loadProducts();
    } catch (error) {
      console.error('Error deleting product', error);
      this.toastService.error('Erro ao excluir o produto.');
    }
  }
}
