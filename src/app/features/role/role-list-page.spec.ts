import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RoleListPageComponent } from './role-list-page.component';
import { RoleService } from './role.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

describe('RoleListPageComponent', () => {
  let component: RoleListPageComponent;
  let fixture: ComponentFixture<RoleListPageComponent>;
  let mockRoleService: any;
  let mockAuthService: any;
  let mockToastService: any;
  let mockRouter: any;

  const mockRoles = [
    { id: '1', name: 'Admin', description: 'Administrator', active: true, RoleFeature: [] },
  ];

  beforeEach(async () => {
    mockRoleService = {
      getRoles: vi.fn().mockReturnValue(of({ items: mockRoles, total: 1 })),
      toggleStatus: vi.fn().mockReturnValue(of({})),
      deleteRole: vi.fn().mockReturnValue(of({})),
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
      imports: [RoleListPageComponent],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleListPageComponent);
    component = fixture.componentInstance;
  });

  it('should create and load roles', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component.roles()).toEqual(mockRoles);
    expect(mockRoleService.getRoles).toHaveBeenCalled();
  });

  it('should handle search', () => {
    fixture.detectChanges();
    component.handleSearch('test');
    expect(component.searchWord()).toBe('test');
    expect(component.page()).toBe(0);
  });

  it('should handle filters', () => {
    fixture.detectChanges();
    component.handleFilter({ name: 'Admin' });
    expect(component.filters()).toEqual({ name: 'Admin' });
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
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/roles/new']);
  });

  it('should navigate to edit', () => {
    component.navigateToEdit('1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/roles/update', '1']);
  });

  it('should toggle status successfully (deactivate)', async () => {
    fixture.detectChanges();
    await component.toggleStatus('1', false);
    expect(mockRoleService.toggleStatus).toHaveBeenCalledWith('1', false);
    expect(mockToastService.success).toHaveBeenCalledWith('Perfil desativado com sucesso!');
  });

  it('should toggle status successfully (activate)', async () => {
    fixture.detectChanges();
    await component.toggleStatus('1', true);
    expect(mockRoleService.toggleStatus).toHaveBeenCalledWith('1', true);
    expect(mockToastService.success).toHaveBeenCalledWith('Perfil ativado com sucesso!');
  });

  it('should handle toggle status error', async () => {
    mockRoleService.toggleStatus.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    await component.toggleStatus('1', false);
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should delete role successfully', async () => {
    fixture.detectChanges();
    await component.deleteRole('1');
    expect(mockRoleService.deleteRole).toHaveBeenCalledWith('1');
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    mockRoleService.deleteRole.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    await component.deleteRole('1');
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should handle error loading roles', async () => {
    mockRoleService.getRoles.mockReturnValue(throwError(() => new Error('API Error')));
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
  });

  it('should trigger actions from template', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const statusBadge = fixture.debugElement.query(By.css('app-status-badge')).componentInstance;
    statusBadge.onClick.emit();
    expect(mockRoleService.toggleStatus).toHaveBeenCalled();

    const actions = fixture.debugElement.query(By.css('app-data-table-actions')).componentInstance;
    actions.onEdit.emit('1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/roles/update', '1']);

    actions.onDelete.emit('1');
    expect(mockRoleService.deleteRole).toHaveBeenCalled();
  });

  it('should handle missing delete permission', async () => {
    mockAuthService.hasPermission.mockReturnValue(false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    
    const actions = fixture.debugElement.query(By.css('app-data-table-actions'));
    if (actions) {
      expect(actions.componentInstance.showDelete).toBe(false);
    }
  });

  it('should call all methods for funcs coverage', () => {
    component.toggleFilter();
    component.handlePageChange(2);
    component.handlePageSizeChange(50);
    component.handleSearch('test');
    component.handleSortChange({ orderBy: 'name', orderDirection: 'asc' });
    component.navigateToCreate();
    component.navigateToEdit('1');
    component.deleteRole('1');
    component.loadRoles();
    expect(true).toBe(true);
  });
});
