import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { UserFormPageComponent } from './user-form-page.component';
import { UserService } from './user.service';
import { RoleService } from '../role/role.service';
import { ToastService } from '../../core/services/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { vi } from 'vitest';

describe('UserFormPageComponent', () => {
  let component: UserFormPageComponent;
  let fixture: ComponentFixture<UserFormPageComponent>;
  let mockUserService: any;
  let mockRoleService: any;
  let mockToastService: any;
  let mockRouter: any;
  let routeParams: BehaviorSubject<any>;

  beforeEach(async () => {
    routeParams = new BehaviorSubject<any>({ id: 'new' });

    mockUserService = {
      getUser: vi.fn().mockReturnValue(
        of({
          id: '1',
          name: 'John',
          email: 'john@example.com',
          id_role: 'r1',
          active: true,
        }),
      ),
      createUser: vi.fn().mockReturnValue(of({})),
      updateUser: vi.fn().mockReturnValue(of({})),
    };

    mockRoleService = {
      mageSelect: vi.fn(),
      mageHydrate: vi.fn(),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [UserFormPageComponent, ReactiveFormsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: RoleService, useValue: mockRoleService },
        { provide: ToastService, useValue: mockToastService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: { params: routeParams.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormPageComponent);
    component = fixture.componentInstance;
  });

  it('should create in creation mode', () => {
    fixture.detectChanges();
    expect(component.isEditing()).toBe(false);
  });

  it('should load user in edit mode', async () => {
    routeParams.next({ id: '1' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isEditing()).toBe(true);
    expect(component.userForm.value.name).toBe('John');
  });

  it('should handle error loading user', async () => {
    routeParams.next({ id: '1' });
    mockUserService.getUser.mockReturnValue(throwError(() => new Error('Error')));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(mockToastService.error).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('should validate form and show errors', () => {
    fixture.detectChanges();
    component.onSubmit();
    expect(component.userForm.invalid).toBe(true);
    expect(component.getError('name')).toBe('Este campo é obrigatório');

    component.userForm.patchValue({ email: 'invalid' });
    expect(component.getError('email')).toBe('Email inválido');
  });

  it('should require password for new users', async () => {
    fixture.detectChanges();
    component.userForm.patchValue({ name: 'N', email: 'n@e.com', id_role: 'r1' });
    await component.onSubmit();
    expect(mockToastService.error).toHaveBeenCalledWith(
      'A senha é obrigatória para novos usuários.',
    );
  });

  it('should create user successfully', async () => {
    fixture.detectChanges();
    component.userForm.patchValue({ name: 'N', email: 'n@e.com', id_role: 'r1', password: '123' });
    await component.onSubmit();
    expect(mockUserService.createUser).toHaveBeenCalled();
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('should update user successfully without changing password', async () => {
    routeParams.next({ id: '1' });
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const passwordInput = fixture.debugElement.query(By.css('app-password-input'));
    expect(passwordInput.componentInstance.placeholder).toBe('Deixe em branco para manter a atual');

    component.userForm.patchValue({ name: 'Updated' });
    await component.onSubmit();
    expect(mockUserService.updateUser).toHaveBeenCalled();
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('should show correct placeholder in creation mode', () => {
    fixture.detectChanges();
    const passwordInput = fixture.debugElement.query(By.css('app-password-input'));
    expect(passwordInput.componentInstance.placeholder).toBe('Senha de acesso');
  });

  it('should handle submit error', async () => {
    fixture.detectChanges();
    component.userForm.patchValue({ name: 'N', email: 'n@e.com', id_role: 'r1', password: '123' });
    mockUserService.createUser.mockReturnValue(throwError(() => new Error('Error')));
    await component.onSubmit();
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('should return null for getError with valid field', () => {
    fixture.detectChanges();
    component.userForm.patchValue({ name: 'Valid Name' });
    expect(component.getError('name')).toBeNull();
  });

  it('should show pending state in submit button', () => {
    component.isPending.set(true);
    fixture.detectChanges();
    const submitBtn = fixture.debugElement.query(By.css('app-button[type="submit"]'));
    expect(submitBtn.nativeElement.textContent).toContain('Salvando...');
    expect(component.isPending()).toBe(true);
  });

  it('should cancel and navigate back', () => {
    component.cancel();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/users']);
  });

  it('should call cancel when clicking cancel buttons', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'cancel');
    const cancelButtons = fixture.debugElement
      .queryAll(By.css('app-button'))
      .filter((b) => b.nativeElement.textContent.includes('Cancelar'));
    cancelButtons.forEach((btn) => btn.triggerEventHandler('btnClick', null));
    expect(spy).toHaveBeenCalledTimes(cancelButtons.length);
  });

  it('should handle missing id in route', async () => {
    routeParams.next({});
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.isEditing()).toBe(false);
    expect(component.id()).toBeNull();
  });

  it('should get role label and value', () => {
    const role = { id: 'r1', name: 'Admin' } as any;
    expect(component.getRoleLabel(role)).toBe('Admin');
    expect(component.getRoleValue(role)).toBe('r1');
  });

  it('should cleanup on destroy', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component['formCtrl'], 'destroy');
    component.ngOnDestroy();
    expect(spy).toHaveBeenCalled();
  });
});
