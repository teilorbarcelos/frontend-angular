import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService, User, UserResponse } from './user.service';
import { AuthService } from '../../core/services/auth.service';
import { ListPageHeaderComponent } from '../../shared/components/list-page-header/list-page-header.component';
import { DataTableComponent, HeaderMapItem, TableSort } from '../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DataTableActionsComponent } from '../../shared/components/data-table-actions/data-table-actions.component';
import { ToastService } from '../../core/services/toast.service';
import { USER_SEARCHABLE_FIELDS } from './constants/user.constants';
import { firstValueFrom } from 'rxjs';
import { UserFiltersComponent } from './components/user-filters.component';

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
    UserFiltersComponent
  ],
  host: {
    class: 'flex-1 flex flex-col min-h-0'
  },
  /* v8 ignore start */
  template: `
    <app-list-page-header
      title="Usuários"
      [showCreate]="permissions().canCreate"
      createLabel="Novo Usuário"
      (onSearch)="handleSearch($event)"
      (onFilterClick)="toggleFilter()"
      [filterCount]="filterCount()"
      (onCreateClick)="navigateToCreate()"
      class="shrink-0"
    ></app-list-page-header>

    <app-user-filters
      [isOpen]="isFilterOpen()"
      [initialValues]="filters()"
      (onClose)="toggleFilter()"
      (onFilter)="handleFilter($event)"
    ></app-user-filters>

    <app-data-table
      [data]="users()"
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
            feature="user" 
            (onClick)="toggleStatus(item.id, !item.active)"
          ></app-status-badge>
        } @else if (column.keyItem === 'id') {
          <app-data-table-actions 
            [id]="item.id" 
            [showEdit]="permissions().canUpdate"
            [showDelete]="permissions().canDelete"
            (onEdit)="navigateToEdit($event)" 
            (onDelete)="deleteUser($event)"
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
  /* v8 ignore stop */
})
export class UserListPageComponent {
  private userService: UserService = inject(UserService);
  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  private toastService: ToastService = inject(ToastService);

  users = signal<User[]>([]);
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

  constructor() {
    effect(() => {
      this.loadUsers();
    });
  }

  async loadUsers() {
    this.isLoading.set(true);
    try {
      const res: UserResponse = await firstValueFrom(
        this.userService.getUsers({
          page: this.page(),
          size: this.size(),
          searchWord: this.searchWord(),
          searchFields: USER_SEARCHABLE_FIELDS,
          filters: this.filters(),
          sort: this.sort(),
          all: true
        })
      );
      this.users.set(res.items);
      this.totalItems.set(res.total);
    } catch (error) {
      console.error('Error loading users', error);
      this.toastService.error('Erro ao carregar a listagem de usuários.');
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
    this.router.navigate(['/users/new']);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/users/update', id]);
  }

  async toggleStatus(id: string, active: boolean) {
    try {
      await firstValueFrom(this.userService.toggleStatus(id, active));
      this.toastService.success(`Usuário ${active ? 'ativado' : 'desativado'} com sucesso!`);
      this.loadUsers();
    } catch (error) {
      console.error('Error toggling status', error);
      this.toastService.error('Erro ao alterar o status do usuário.');
    }
  }

  async deleteUser(id: string) {
    try {
      await firstValueFrom(this.userService.deleteUser(id));
      this.toastService.success('Usuário excluído com sucesso!');
      this.loadUsers();
    } catch (error) {
      console.error('Error deleting user', error);
      this.toastService.error('Erro ao excluir o usuário.');
    }
  }
}
