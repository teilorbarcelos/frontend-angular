import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RoleService, Role, RoleResponse } from './role.service';
import { AuthService } from '../../core/services/auth.service';
import { ListPageHeaderComponent } from '../../shared/components/list-page-header/list-page-header.component';
import { DataTableComponent, HeaderMapItem, TableSort } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DataTableActionsComponent } from '../../shared/components/data-table-actions/data-table-actions.component';
import { ToastService } from '../../core/services/toast.service';
import { ROLE_SEARCHABLE_FIELDS } from './constants/role.constants';
import { firstValueFrom } from 'rxjs';
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
  private roleService: RoleService = inject(RoleService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private toastService: ToastService = inject(ToastService);

  roles = signal<Role[]>([]);
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

  constructor() {
    effect(() => {
      this.loadRoles();
    });
  }

  async loadRoles() {
    this.isLoading.set(true);
    try {
      const res: RoleResponse = await firstValueFrom(
        this.roleService.getRoles({
          page: this.page(),
          size: this.size(),
          searchWord: this.searchWord(),
          searchFields: ROLE_SEARCHABLE_FIELDS,
          filters: this.filters(),
          sort: this.sort(),
          all: true
        })
      );
      this.roles.set(res.items);
      this.totalItems.set(res.total);
    } catch (error) {
      console.error('Error loading roles', error);
      this.toastService.error('Erro ao carregar a listagem de perfis.');
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
    this.router.navigate(['/roles/new']);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/roles/update', id]);
  }

  async toggleStatus(id: string, active: boolean) {
    try {
      await firstValueFrom(this.roleService.toggleStatus(id, active));
      this.toastService.success(`Perfil ${active ? 'ativado' : 'desativado'} com sucesso!`);
      this.loadRoles();
    } catch (error) {
      console.error('Error toggling status', error);
      this.toastService.error('Erro ao alterar o status do perfil.');
    }
  }

  async deleteRole(id: string) {
    try {
      await firstValueFrom(this.roleService.deleteRole(id));
      this.toastService.success('Perfil excluído com sucesso!');
      this.loadRoles();
    } catch (error) {
      console.error('Error deleting role', error);
      this.toastService.error('Erro ao excluir o perfil.');
    }
  }
}
