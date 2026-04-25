import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService, Product } from './product.service';
import { AuthService } from '../../core/services/auth.service';
import { ListPageHeaderComponent } from '../../shared/components/list-page-header/list-page-header.component';
import { DataTableComponent, HeaderMapItem } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DataTableActionsComponent } from '../../shared/components/data-table-actions/data-table-actions.component';
import { PRODUCT_SEARCHABLE_FIELDS } from './constants/product.constants';
import { createListPageController } from '../../core/utils/list-page.utils';

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
  /* v8 ignore start */
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
  /* v8 ignore stop */
})
export class ProductListPageComponent {
  private productService = inject(ProductService);
  private authService = inject(AuthService);

  private list = createListPageController<Product>({
    feature: 'produto',
    baseRoute: '/products',
    searchFields: PRODUCT_SEARCHABLE_FIELDS,
    fetch: (params) => this.productService.getProducts(params),
    toggleStatus: (id, active) => this.productService.toggleStatus(id, active),
    delete: (id) => this.productService.deleteProduct(id),
  });

  products = this.list.items;
  totalItems = this.list.totalItems;
  isLoading = this.list.isLoading;
  isFilterOpen = this.list.isFilterOpen;
  page = this.list.page;
  size = this.list.size;
  searchWord = this.list.searchWord;
  filters = this.list.filters;
  sort = this.list.sort;
  filterCount = this.list.filterCount;

  handleSearch = this.list.handleSearch;
  handleFilter = this.list.handleFilter;
  handlePageChange = this.list.handlePageChange;
  handlePageSizeChange = this.list.handlePageSizeChange;
  handleSortChange = this.list.handleSortChange;
  toggleFilter = this.list.toggleFilter;
  navigateToCreate = this.list.navigateToCreate;
  navigateToEdit = this.list.navigateToEdit;
  toggleStatus = this.list.toggleStatus;
  deleteProduct = this.list.deleteItem;
  loadProducts = this.list.loadItems;

  permissions = computed(() => ({
    canCreate: this.authService.hasPermission('product', 'create'),
    canUpdate: this.authService.hasPermission('product', 'create'),
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
}
