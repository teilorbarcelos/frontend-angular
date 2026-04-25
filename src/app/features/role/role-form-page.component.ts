import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleService, Role, Feature, RoleFeature } from './role.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ToastService } from '../../core/services/toast.service';
import { createFormPageController } from '../../core/utils/form-page.utils';
import { firstValueFrom } from 'rxjs';
import { RolePermissionsMatrixComponent } from './components/role-permissions-matrix.component';

@Component({
  selector: 'app-role-form-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    RolePermissionsMatrixComponent,
  ],
  template: `
    <div class="overflow-y-auto flex-1 pb-8">
      <div
        class="max-w-4xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <div class="flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 class="text-xl font-bold text-gray-900">
            {{ isEditing() ? 'Editar Perfil' : 'Novo Perfil' }}
          </h1>
          <app-button variant="ghost" (onClick)="cancel()"> Cancelar </app-button>
        </div>

        @if ((isEditing() && isLoadingRole()) || isLoadingFeatures()) {
          <div class="p-8 text-center text-gray-500 text-sm italic">Carregando dados...</div>
        } @else {
          <form [formGroup]="roleForm" (ngSubmit)="onSubmit()" class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <app-input
                label="Nome do Perfil"
                formControlName="name"
                placeholder="Ex: Administrador"
                [error]="getError('name')"
              ></app-input>

              <app-input
                label="Descrição"
                formControlName="description"
                placeholder="Descrição das responsabilidades"
                [error]="getError('description')"
              ></app-input>
            </div>

            <app-role-permissions-matrix
              [parentForm]="roleForm"
              [features]="features()"
            ></app-role-permissions-matrix>

            <div class="pt-4 flex justify-end space-x-3">
              <app-button type="button" variant="secondary" (onClick)="cancel()">
                Cancelar
              </app-button>
              <app-button type="submit" [disabled]="isPending()">
                {{
                  isPending() ? 'Salvando...' : isEditing() ? 'Atualizar Perfil' : 'Salvar Perfil'
                }}
              </app-button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class RoleFormPageComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private toastService = inject(ToastService);

  roleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    permissions: this.fb.array([]),
  });

  features = signal<Feature[]>([]);
  isLoadingFeatures = signal(false);

  private formCtrl = createFormPageController<
    Role,
    { name: string; description: string; permissions: RoleFeature[] }
  >({
    feature: 'perfil',
    baseRoute: '/roles',
    form: this.roleForm,
    fetch: (id) => this.roleService.getRole(id),
    create: (data) => this.roleService.createRole(data),
    update: (id, data) => this.roleService.updateRole(id, data),
    onLoadSuccess: (role) => {
      this.roleForm.patchValue({
        name: role.name,
        description: role.description,
      });
      this.initializePermissions(role.RoleFeature);
    },
    onBeforeSave: (data) => {
      const typedData = data as { name: string; description: string; permissions: RoleFeature[] };
      return typedData;
    },
  });

  id = this.formCtrl.id;
  isEditing = this.formCtrl.isEditing;
  isLoadingRole = this.formCtrl.isLoading;
  isPending = this.formCtrl.isPending;

  getError = this.formCtrl.getError;
  onSubmit = this.formCtrl.onSubmit;
  cancel = this.formCtrl.cancel;

  get permissionsFormArray() {
    return this.roleForm.get('permissions') as FormArray;
  }

  async ngOnInit() {
    await this.loadFeatures();
    this.formCtrl.init();

    if (!this.isEditing()) {
      this.initializePermissions();
    }
  }

  ngOnDestroy() {
    this.formCtrl.destroy();
  }

  async loadFeatures() {
    this.isLoadingFeatures.set(true);
    try {
      const features = await firstValueFrom(this.roleService.getFeatures());
      this.features.set(features);
    } catch (error) {
      console.error('Error loading features', error);
      this.toastService.error('Erro ao carregar features.');
    } finally {
      this.isLoadingFeatures.set(false);
    }
  }

  initializePermissions(existingPermissions: RoleFeature[] = []) {
    this.permissionsFormArray.clear();

    this.features().forEach((feature) => {
      const existing = existingPermissions.find((p) => p.id_feature === feature.id);

      this.permissionsFormArray.push(
        this.fb.group({
          id_feature: [feature.id],
          view: [existing?.view ?? false],
          create: [existing?.create ?? false],
          delete: [existing?.delete ?? false],
          activate: [existing?.activate ?? false],
        }),
      );
    });
  }
}
