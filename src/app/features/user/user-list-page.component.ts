import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from './user.service';
import { AuthService } from '../../core/services/auth.service';
import { ListPageHeaderComponent } from '../../shared/components/list-page-header/list-page-header.component';
import {
  DataTableComponent,
  HeaderMapItem,
  TableSort,
} from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DataTableActionsComponent } from '../../shared/components/data-table-actions/data-table-actions.component';
import { USER_SEARCHABLE_FIELDS } from './constants/user.constants';
import { createListPageController } from '../../core/utils/list-page.utils';
import { UserFiltersComponent } from './components/user-filters.component';
import { ExportPdfButtonComponent } from '../../shared/components/export-pdf-button/export-pdf-button.component';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListPageHeaderComponent,
    DataTableComponent,
    StatusBadgeComponent,
    DataTableActionsComponent,
    UserFiltersComponent,
    ExportPdfButtonComponent,
  ],
  host: {
    class: 'flex-1 flex flex-col min-h-0',
  },
  template: `
    <app-list-page-header
      title="Usuários"
      [showCreate]="permissions().canCreate"
      createLabel="Novo Usuário"
      (searched)="handleSearch($event)"
      (filterClick)="toggleFilter()"
      [filterCount]="filterCount()"
      (createClick)="navigateToCreate()"
      class="shrink-0"
    >
      <app-export-pdf-button
        extraActions
        [onExport]="exportUsersPdf"
        [queryParams]="exportParams()"
        filename="usuarios.pdf"
      ></app-export-pdf-button>
    </app-list-page-header>

    <app-user-filters
      [isOpen]="isFilterOpen()"
      [initialValues]="filters()"
      (closed)="toggleFilter()"
      (filtered)="handleFilter($event)"
    ></app-user-filters>

    <app-data-table
      [data]="users()"
      [headerMap]="columns"
      [isLoading]="isLoading()"
      [totalItems]="totalItems()"
      [currentPage]="page()"
      [pageSize]="size()"
      [sorting]="sort()"
      (pageChange)="handlePageChange($event)"
      (pageSizeChange)="handlePageSizeChange($event)"
      (sortChange)="handleSortChange($event)"
    >
      <ng-template #cellTemplate let-item let-column="column" let-value="value">
        @if (column.keyItem === 'active') {
          <app-status-badge
            [active]="!!value"
            feature="user"
            (btnClick)="toggleStatus(item.id, !item.active)"
          ></app-status-badge>
        } @else if (column.keyItem === 'id') {
          <app-data-table-actions
            [id]="item.id"
            [showEdit]="permissions().canUpdate"
            [showDelete]="permissions().canDelete"
            (edit)="navigateToEdit($event)"
            (delete)="deleteUser($event)"
            deleteMessage="Tem certeza que deseja excluir este usuário?"
          ></app-data-table-actions>
        } @else {
          <div [class.truncate]="column.truncate" [class.max-w-xs]="column.truncate">
            {{ value }}
          </div>
        }
      </ng-template>
    </app-data-table>
  `,
})
export class UserListPageComponent {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  exportParams = computed(() => ({
    searchWord: this.searchWord(),
    searchFields: USER_SEARCHABLE_FIELDS,
    filters: this.filters(),
    sort: this.sort(),
  }));

  exportUsersPdf = (params: {
    searchWord?: string;
    searchFields?: string[];
    filters?: Record<string, unknown>;
    sort?: { orderBy?: string; orderDirection?: string };
  }) => {
    return this.userService.exportUsersPdf(params);
  };

  private list = createListPageController<User>({
    feature: 'usuário',
    baseRoute: '/users',
    searchFields: USER_SEARCHABLE_FIELDS,
    fetch: (params) => this.userService.getUsers(params),
    toggleStatus: (id, active) => this.userService.toggleStatus(id, active),
    delete: (id) => this.userService.deleteUser(id),
  });

  users = this.list.items;
  totalItems = this.list.totalItems;
  isLoading = this.list.isLoading;
  isFilterOpen = this.list.isFilterOpen;
  page = this.list.page;
  size = this.list.size;
  searchWord = this.list.searchWord;
  filters = this.list.filters;
  sort = this.list.sort;
  filterCount = this.list.filterCount;

  handleSearch(value: string) {
    this.list.handleSearch(value);
  }
  handleFilter(filters: Record<string, unknown>) {
    this.list.handleFilter(filters);
  }
  handlePageChange(page: number) {
    this.list.handlePageChange(page);
  }
  handlePageSizeChange(size: number) {
    this.list.handlePageSizeChange(size);
  }
  handleSortChange(sort: TableSort) {
    this.list.handleSortChange(sort);
  }
  toggleFilter() {
    this.list.toggleFilter();
  }
  navigateToCreate() {
    this.list.navigateToCreate();
  }
  navigateToEdit(id: string) {
    this.list.navigateToEdit(id);
  }
  toggleStatus(id: string, active: boolean) {
    this.list.toggleStatus(id, active);
  }
  deleteUser(id: string) {
    this.list.deleteItem(id);
  }
  loadUsers() {
    this.list.loadItems();
  }

  permissions = computed(() => ({
    canCreate: this.authService.hasPermission('user', 'create'),
    canUpdate: this.authService.hasPermission('user', 'create'),
    canDelete: this.authService.hasPermission('user', 'delete'),
  }));

  columns: HeaderMapItem<User>[] = [
    { title: 'Nome', keyItem: 'name', truncate: true, sortable: true },
    { title: 'Email', keyItem: 'email', truncate: true, sortable: true },
    { title: 'Status', keyItem: 'active', sortable: true },
    { title: '', keyItem: 'id' },
  ];
}
