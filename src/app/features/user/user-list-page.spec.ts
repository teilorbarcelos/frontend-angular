import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserListPageComponent } from './user-list-page.component';
import { UserService } from './user.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('UserListPageComponent', () => {
  let component: UserListPageComponent;
  let fixture: ComponentFixture<UserListPageComponent>;
  let mockUserService: any;
  let mockAuthService: any;
  let mockToastService: any;
  let mockRouter: any;

  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', active: true, id_role: '1' },
  ];

  beforeEach(async () => {
    mockUserService = {
      getUsers: vi.fn().mockReturnValue(of({ items: mockUsers, total: 1 })),
      toggleStatus: vi.fn().mockReturnValue(of({})),
      deleteUser: vi.fn().mockReturnValue(of({})),
    };

    mockAuthService = {
      hasPermission: vi.fn().mockReturnValue(true),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [UserListPageComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserListPageComponent);
    component = fixture.componentInstance;
  });

  it('should create and load users', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component.users()).toEqual(mockUsers);
    expect(mockUserService.getUsers).toHaveBeenCalled();
  });

  it('should handle search', () => {
    fixture.detectChanges();
    component.handleSearch('test');
    expect(component.searchWord()).toBe('test');
    expect(component.page()).toBe(0);
  });

  it('should handle filters', () => {
    fixture.detectChanges();
    component.handleFilter({ active: true });
    expect(component.filters()).toEqual({ active: true });
    expect(component.page()).toBe(0);
  });

  it('should handle page change', () => {
    fixture.detectChanges();
    component.handlePageChange(2);
    expect(component.page()).toBe(2);
  });

  it('should toggle filter drawer', () => {
    fixture.detectChanges();
    component.toggleFilter();
    expect(component.isFilterOpen()).toBe(true);
    component.toggleFilter();
    expect(component.isFilterOpen()).toBe(false);
  });

  it('should navigate to create', () => {
    component.navigateToCreate();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/users/new']);
  });

  it('should navigate to edit', () => {
    component.navigateToEdit('1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/users/update', '1']);
  });

  it('should toggle status successfully (deactivate)', async () => {
    fixture.detectChanges();
    await component.toggleStatus('1', false);
    expect(mockUserService.toggleStatus).toHaveBeenCalledWith('1', false);
    expect(mockToastService.success).toHaveBeenCalledWith('Usuário desativado com sucesso!');
  });

  it('should toggle status successfully (activate)', async () => {
    fixture.detectChanges();
    await component.toggleStatus('1', true);
    expect(mockUserService.toggleStatus).toHaveBeenCalledWith('1', true);
    expect(mockToastService.success).toHaveBeenCalledWith('Usuário ativado com sucesso!');
  });

  it('should handle toggle status error', async () => {
    mockUserService.toggleStatus.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    await component.toggleStatus('1', false);
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should delete user successfully', async () => {
    fixture.detectChanges();
    await component.deleteUser('1');
    expect(mockUserService.deleteUser).toHaveBeenCalledWith('1');
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    mockUserService.deleteUser.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    await component.deleteUser('1');
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should handle error loading users', async () => {
    mockUserService.getUsers.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should handle page size change', () => {
    fixture.detectChanges();
    component.handlePageSizeChange(50);
    expect(component.size()).toBe(50);
    expect(component.page()).toBe(0);
  });

  it('should handle sort change', () => {
    fixture.detectChanges();
    const newSort = { orderBy: 'name', orderDirection: 'desc' as const };
    component.handleSortChange(newSort);
    expect(component.sort()).toEqual(newSort);
  });

  it('should render template columns correctly', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('app-status-badge')).toBeTruthy();
    expect(compiled.querySelector('app-data-table-actions')).toBeTruthy();
    
    // Check for generic column (name)
    const cells = compiled.querySelectorAll('td');
    const hasName = Array.from(cells).some((cell: any) => cell.textContent.includes('John Doe'));
    expect(hasName).toBe(true);
  });
});
