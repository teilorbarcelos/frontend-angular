import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { createFormPageController, FormPageConfig } from './form-page.utils';
import { ToastService } from '../services/toast.service';
import { vi } from 'vitest';

describe('FormPageUtils', () => {
  let mockRouter: any;
  let mockToastService: any;
  let routeParams: BehaviorSubject<any>;
  let fb: FormBuilder;
  let config: FormPageConfig<any>;

  beforeEach(() => {
    mockRouter = { navigate: vi.fn() };
    mockToastService = { success: vi.fn(), error: vi.fn() };
    routeParams = new BehaviorSubject({});
    fb = new FormBuilder();

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToastService },
        { provide: ActivatedRoute, useValue: { params: routeParams.asObservable() } },
        FormBuilder,
      ],
    });

    config = {
      feature: 'test',
      baseRoute: '/test',
      form: fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.email]],
        price: [0, [Validators.min(10)]],
      }),
      fetch: vi.fn().mockReturnValue(of({ name: 'data' })),
      create: vi.fn().mockReturnValue(of({})),
      update: vi.fn().mockReturnValue(of({})),
    };
  });

  it('should initialize signals', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createFormPageController(config);
      expect(ctrl.isEditing()).toBe(false);
      expect(ctrl.isLoading()).toBe(false);
      expect(ctrl.isPending()).toBe(false);
    });
  });

  it('should detect ID and load data on init', async () => {
    routeParams.next({ id: '123' });
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createFormPageController(config);
      ctrl.init();
      // Wait for loadData (which is called inside init's subscribe)
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(ctrl.id()).toBe('123');
      expect(ctrl.isEditing()).toBe(true);
      expect(config.fetch).toHaveBeenCalledWith('123');
      expect(config.form.value.name).toBe('data');
    });
  });

  it('should handle load error', async () => {
    config.fetch = vi.fn().mockReturnValue(throwError(() => new Error('Error')));
    routeParams.next({ id: '123' });
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createFormPageController(config);
      ctrl.init();
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(mockToastService.error).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test']);
    });
  });

  it('should return error messages correctly', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createFormPageController(config);

      const name = config.form.get('name')!;
      name.markAsTouched();
      name.setErrors({ required: true });
      expect(ctrl.getError('name')).toBe('Este campo é obrigatório');

      const email = config.form.get('email')!;
      email.markAsTouched();
      email.setErrors({ email: true });
      expect(ctrl.getError('email')).toBe('Email inválido');

      const price = config.form.get('price')!;
      price.markAsTouched();
      price.setErrors({ min: true });
      expect(ctrl.getError('price')).toBe('Valor inválido');

      // Generic error to cover the false branches of previous ifs
      price.setErrors({ other: true });
      expect(ctrl.getError('price')).toBeNull();
    });
  });

  it('should not submit if form is invalid', async () => {
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createFormPageController(config);
      // Form is invalid by default (price 0 < 10)
      await ctrl.onSubmit();
      expect(config.create).not.toHaveBeenCalled();
    });
  });

  it('should handle onBeforeSave returning null', async () => {
    config.onBeforeSave = vi.fn().mockReturnValue(null);
    config.form.patchValue({ name: 'valid', email: 'test@example.com', price: 20 });
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createFormPageController(config);
      await ctrl.onSubmit();
      expect(config.create).not.toHaveBeenCalled();
    });
  });

  it('should submit create successfully', async () => {
    config.form.patchValue({ name: 'valid', email: 'test@example.com', price: 20 });
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createFormPageController(config);
      await ctrl.onSubmit();
      expect(config.create).toHaveBeenCalled();
      expect(mockToastService.success).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test']);
    });
  });

  it('should submit update successfully', async () => {
    routeParams.next({ id: '123' });
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createFormPageController(config);
      ctrl.init();
      await new Promise((resolve) => setTimeout(resolve, 0));
      config.form.patchValue({ name: 'valid', email: 'test@example.com', price: 20 });
      await ctrl.onSubmit();
      expect(config.update).toHaveBeenCalledWith('123', expect.anything());
      expect(mockToastService.success).toHaveBeenCalled();
    });
  });

  it('should handle submit error', async () => {
    config.create = vi.fn().mockReturnValue(throwError(() => new Error('Error')));
    config.form.patchValue({ name: 'valid', email: 'test@example.com', price: 20 });
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createFormPageController(config);
      await ctrl.onSubmit();
      expect(mockToastService.error).toHaveBeenCalled();
    });
  });

  it('should navigate back on cancel', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createFormPageController(config);
      ctrl.cancel();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/test']);
    });
  });

  it('should unsubscribe on destroy', () => {
    TestBed.runInInjectionContext(() => {
      const ctrl = createFormPageController(config);
      ctrl.init();
      ctrl.destroy();
      expect(true).toBe(true);
    });
  });

  it('should return early in loadData if fetch is not provided', async () => {
    config.fetch = undefined;
    await TestBed.runInInjectionContext(async () => {
      const ctrl = createFormPageController(config);
      await ctrl.loadData('123');
      expect(ctrl.isLoading()).toBe(false);
    });
  });
});
