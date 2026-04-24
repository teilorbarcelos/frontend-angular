import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { 
  FormBuilder, 
  FormGroup, 
  FormArray,
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { RoleService, Role, Feature, RoleFeature } from './role.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ToastService } from '../../core/services/toast.service';
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
    RolePermissionsMatrixComponent
  ],
  template: `
    <div class="overflow-y-auto flex-1 pb-8">
      <div class="max-w-4xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 class="text-xl font-bold text-gray-900">
            {{ isEditing() ? 'Editar Perfil' : 'Novo Perfil' }}
          </h1>
          <app-button variant="ghost" (onClick)="cancel()">
            Cancelar
          </app-button>
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
                {{ isPending() ? 'Salvando...' : (isEditing() ? 'Atualizar Perfil' : 'Salvar Perfil') }}
              </app-button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class RoleFormPageComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private roleService: RoleService = inject(RoleService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private toastService: ToastService = inject(ToastService);

  roleForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]],
    permissions: this.fb.array([]),
  });

  features = signal<Feature[]>([]);
  id = signal<string | null>(null);
  isEditing = signal(false);
  isLoadingRole = signal(false);
  isLoadingFeatures = signal(false);
  isPending = signal(false);

  get permissionsFormArray() {
    return this.roleForm.get('permissions') as FormArray;
  }

  async ngOnInit() {
    await this.loadFeatures();
    
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && id !== 'new') {
        this.id.set(id);
        this.isEditing.set(true);
        this.loadRole(id);
      } else {
        this.initializePermissions();
      }
    });
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

  async loadRole(id: string) {
    this.isLoadingRole.set(true);
    try {
      const role: Role = await firstValueFrom(this.roleService.getRole(id));
      this.roleForm.patchValue({
        name: role.name,
        description: role.description,
      });

      this.initializePermissions(role.RoleFeature);
    } catch (error) {
      console.error('Error loading role', error);
      this.toastService.error('Erro ao carregar os dados do perfil.');
      this.router.navigate(['/roles']);
    } finally {
      this.isLoadingRole.set(false);
    }
  }

  initializePermissions(existingPermissions: RoleFeature[] = []) {
    this.permissionsFormArray.clear();
    
    this.features().forEach(feature => {
      const existing = existingPermissions.find(p => p.id_feature === feature.id);
      
      this.permissionsFormArray.push(this.fb.group({
        id_feature: [feature.id],
        view: [existing?.view ?? false],
        create: [existing?.create ?? false],
        delete: [existing?.delete ?? false],
        activate: [existing?.activate ?? false],
      }));
    });
  }

  getError(field: string): string | null {
    const control = this.roleForm.get(field);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'Este campo é obrigatório';
    }
    return null;
  }

  async onSubmit() {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    this.isPending.set(true);
    const data = this.roleForm.value;

    try {
      if (this.isEditing()) {
        await firstValueFrom(this.roleService.updateRole(this.id()!, data));
        this.toastService.success('Perfil atualizado com sucesso!');
      } else {
        await firstValueFrom(this.roleService.createRole(data));
        this.toastService.success('Perfil cadastrado com sucesso!');
      }
      this.router.navigate(['/roles']);
    } catch (error) {
      console.error('Error saving role', error);
      this.toastService.error('Ocorreu um erro ao salvar o perfil.');
    } finally {
      this.isPending.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/roles']);
  }
}
