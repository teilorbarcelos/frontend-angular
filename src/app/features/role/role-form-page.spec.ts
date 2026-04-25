import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RoleFormPageComponent } from './role-form-page.component';
import { RoleService } from './role.service';
import { ToastService } from '../../core/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

describe('RoleFormPageComponent', () => {
  let component: RoleFormPageComponent;
  let fixture: ComponentFixture<RoleFormPageComponent>;
  let mockRoleService: any;
  let mockToastService: any;
  let mockRouter: any;
  let routeParams: BehaviorSubject<any>;

  const mockFeatures = [
    { id: 'f1', name: 'Feature 1', description: 'Desc 1' }
  ];

  beforeEach(async () => {
    routeParams = new BehaviorSubject<any>({ id: 'new' });

    mockRoleService = {
      getFeatures: vi.fn().mockReturnValue(of(mockFeatures)),
      getRole: vi.fn().mockReturnValue(of({
        id: '1',
        name: 'Admin',
        description: 'Administrator',
        active: true,
        RoleFeature: [{ id_feature: 'f1', view: true, create: true, delete: false, activate: false }]
      })),
      createRole: vi.fn().mockReturnValue(of({})),
      updateRole: vi.fn().mockReturnValue(of({})),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [RoleFormPageComponent, ReactiveFormsModule],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { params: routeParams.asObservable() }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleFormPageComponent);
    component = fixture.componentInstance;
  });

  it('should create and load features in creation mode', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isEditing()).toBe(false);
    expect(component.features()).toEqual(mockFeatures);
    expect(component.permissionsFormArray.length).toBe(1);
    
    // Check if form is rendered
    const form = fixture.nativeElement.querySelector('form');
    expect(form).toBeTruthy();
  });

  it('should load role in edit mode', async () => {
    routeParams.next({ id: '1' });
    await component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isEditing()).toBe(true);
    expect(component.roleForm.value.name).toBe('Admin');
    expect(component.permissionsFormArray.at(0).value.view).toBe(true);
    
    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent).toContain('Editar Perfil');
  });

  it('should handle error loading features', async () => {
    mockRoleService.getFeatures.mockReturnValue(throwError(() => new Error('Error')));
    await component.ngOnInit();
    fixture.detectChanges();
    expect(mockToastService.error).toHaveBeenCalledWith('Erro ao carregar features.');
  });

  it('should handle error loading role', async () => {
    routeParams.next({ id: '1' });
    mockRoleService.getRole.mockReturnValue(throwError(() => new Error('Error')));
    await component.ngOnInit();
    fixture.detectChanges();
    expect(mockToastService.error).toHaveBeenCalledWith('Erro ao carregar os dados do perfil.');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/roles']);
  });

  it('should validate form and show errors', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    component.onSubmit();
    expect(component.roleForm.invalid).toBe(true);
    expect(component.getError('name')).toBe('Este campo é obrigatório');
  });

  it('should create role successfully', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    component.roleForm.patchValue({ name: 'New Role', description: 'Desc' });
    await component.onSubmit();
    expect(mockRoleService.createRole).toHaveBeenCalled();
    expect(mockToastService.success).toHaveBeenCalledWith('Perfil cadastrado com sucesso!');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/roles']);
  });

  it('should update role successfully', async () => {
    routeParams.next({ id: '1' });
    await component.ngOnInit();
    fixture.detectChanges();

    component.roleForm.patchValue({ name: 'Updated Role' });
    await component.onSubmit();
    expect(mockRoleService.updateRole).toHaveBeenCalled();
    expect(mockToastService.success).toHaveBeenCalledWith('Perfil atualizado com sucesso!');
  });

  it('should handle submit error', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    component.roleForm.patchValue({ name: 'New Role', description: 'Desc' });
    mockRoleService.createRole.mockReturnValue(throwError(() => new Error('Error')));
    await component.onSubmit();
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should return null for getError with valid field', () => {
    fixture.detectChanges();
    component.roleForm.patchValue({ name: 'Valid Name' });
    expect(component.getError('name')).toBeNull();
  });

  it('should cancel and navigate back', () => {
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/roles']);
  });

  it('should initialize permissions correctly when some are missing', () => {
    const mockFeats = [
      { id: 'f1', name: 'F1', description: 'D1' },
      { id: 'f2', name: 'F2', description: 'D2' }
    ];
    component.features.set(mockFeats);
    const existing = [
      { id_feature: 'f1', view: true, create: false, delete: false, activate: false }
    ];
    component.initializePermissions(existing as any);
    expect(component.permissionsFormArray.length).toBe(2);
    expect(component.permissionsFormArray.at(0).value.view).toBe(true);
    expect(component.permissionsFormArray.at(1).value.view).toBe(false);
  });
});
