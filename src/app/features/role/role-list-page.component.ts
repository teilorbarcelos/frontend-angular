import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoleService, Role } from './role.service';
import { AuthService } from '../../core/services/auth.service';
import { ListPageHeaderComponent } from '../../shared/components/list-page-header/list-page-header.component';
import { DataTableComponent, HeaderMapItem } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DataTableActionsComponent } from '../../shared/components/data-table-actions/data-table-actions.component';
import { ROLE_SEARCHABLE_FIELDS } from './constants/role.constants';
import { createListPageController } from '../../core/utils/list-page.utils';
import { RoleFiltersComponent } from './components/role-filters.component';

@Component({
  selector: 'app-role-list-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ListPageHeaderComponent, 
    DataTableComponent, 
    StatusBadgeComponent, 
    DataTableActionsComponent,
    RoleFiltersComponent
  ],
  host: {
    class: 'flex-1 flex flex-col min-h-0'
  },
  /* v8 ignore start */
  template: `
    <app-list-page-header
      title="Perfis"
      [showCreate]="permissions().canCreate"
      createLabel="Novo Perfil"
      (onSearch)="handleSearch($event)"
      (onFilterClick)="toggleFilter()"
      [filterCount]="filterCount()"
      (onCreateClick)="navigateToCreate()"
      class="shrink-0"
    ></app-list-page-header>

    <app-role-filters
      [isOpen]="isFilterOpen()"
      [initialValues]="filters()"
      (onClose)="toggleFilter()"
      (onFilter)="handleFilter($event)"
    ></app-role-filters>

    <app-data-table
      [data]="roles()"
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
            feature="role" 
            (onClick)="toggleStatus(item.id, !item.active)"
          ></app-status-badge>
        } @else if (column.keyItem === 'id') {
          <app-data-table-actions 
            [id]="item.id" 
            [showEdit]="permissions().canUpdate"
            [showDelete]="permissions().canDelete"
            (onEdit)="navigateToEdit($event)" 
            (onDelete)="deleteRole($event)"
            deleteMessage="Tem certeza que deseja excluir esta role?"
          ></app-data-table-actions>
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
export class RoleListPageComponent {
  private roleService = inject(RoleService);
  private authService = inject(AuthService);

  private list = createListPageController<Role>({
    feature: 'perfil',
    baseRoute: '/roles',
    searchFields: ROLE_SEARCHABLE_FIELDS,
    fetch: (params) => this.roleService.getRoles(params),
    toggleStatus: (id, active) => this.roleService.toggleStatus(id, active),
    delete: (id) => this.roleService.deleteRole(id),
  });

  roles = this.list.items;
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
  deleteRole = this.list.deleteItem;
  loadRoles = this.list.loadItems;

  permissions = computed(() => ({
    canCreate: this.authService.hasPermission('role', 'create'),
    canUpdate: this.authService.hasPermission('role', 'create'),
    canDelete: this.authService.hasPermission('role', 'delete'),
  }));

  columns: HeaderMapItem<Role>[] = [
    { title: 'Nome', keyItem: 'name', truncate: true, sortable: true },
    { title: 'Descrição', keyItem: 'description', truncate: true, sortable: true },
    { title: 'Status', keyItem: 'active', sortable: true },
    { title: '', keyItem: 'id' },
  ];
}
