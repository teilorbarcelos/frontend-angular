import { inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { Observable, firstValueFrom, Subscription } from 'rxjs';
import { ToastService } from '../services/toast.service';

export interface FormPageConfig<T, D = any> {
  feature: string;
  baseRoute: string;
  form: FormGroup;
  fetch?: (id: string) => Observable<T>;
  create: (data: D) => Observable<any>;
  update: (id: string, data: D) => Observable<any>;
  onLoadSuccess?: (data: T) => void;
  onBeforeSave?: (data: any) => D | null | undefined;
  messages?: {
    createSuccess?: string;
    updateSuccess?: string;
    loadError?: string;
    saveError?: string;
  };
}

export function createFormPageController<T, D = any>(config: FormPageConfig<T, D>) {
  const router = inject(Router);
  const route = inject(ActivatedRoute);
  const toastService = inject(ToastService);

  const id = signal<string | null>(null);
  const isEditing = signal(false);
  const isLoading = signal(false);
  const isPending = signal(false);

  let routeSub: Subscription | null = null;

  function init() {
    routeSub = route.params.subscribe(params => {
      const routeId = params['id'];
      if (routeId && routeId !== 'new') {
        id.set(routeId);
        isEditing.set(true);
        loadData(routeId);
      }
    });
  }

  function destroy() {
    routeSub?.unsubscribe();
  }

  async function loadData(dataId: string) {
    if (!config.fetch) return;
    isLoading.set(true);
    try {
      const data = await firstValueFrom(config.fetch(dataId));
      if (config.onLoadSuccess) {
        config.onLoadSuccess(data);
      } else {
        config.form.patchValue(data as any);
      }
    } catch (error) {
      console.error(`Error loading ${config.feature}`, error);
      toastService.error(config.messages?.loadError || `Erro ao carregar os dados do ${config.feature}.`);
      router.navigate([config.baseRoute]);
    } finally {
      isLoading.set(false);
    }
  }

  function getError(field: string): string | null {
    const control = config.form.get(field);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'Este campo é obrigatório';
      if (control.errors?.['email']) return 'Email inválido';
      if (control.errors?.['min']) return 'Valor inválido';
    }
    return null;
  }

  async function onSubmit() {
    if (config.form.invalid) {
      config.form.markAllAsTouched();
      return;
    }

    let data = config.form.value;
    
    if (config.onBeforeSave) {
      const transformed = config.onBeforeSave(data);
      if (transformed === null || transformed === undefined) {
         return; // Logic in hook handled errors or cancellation
      }
      data = transformed;
    }

    isPending.set(true);
    try {
      if (isEditing()) {
        await firstValueFrom(config.update(id()!, data));
        toastService.success(config.messages?.updateSuccess || `${config.feature.charAt(0).toUpperCase() + config.feature.slice(1)} atualizado com sucesso!`);
      } else {
        await firstValueFrom(config.create(data));
        toastService.success(config.messages?.createSuccess || `${config.feature.charAt(0).toUpperCase() + config.feature.slice(1)} cadastrado com sucesso!`);
      }
      router.navigate([config.baseRoute]);
    } catch (error) {
      console.error(`Error saving ${config.feature}`, error);
      toastService.error(config.messages?.saveError || `Ocorreu um erro ao salvar o ${config.feature}.`);
    } finally {
      isPending.set(false);
    }
  }

  function cancel() {
    router.navigate([config.baseRoute]);
  }

  return {
    id,
    isEditing,
    isLoading,
    isPending,
    init,
    destroy,
    getError,
    onSubmit,
    cancel,
    loadData
  };
}
