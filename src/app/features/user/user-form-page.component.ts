import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { UserService, User } from './user.service';
import { RoleService, Role } from '../role/role.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { PasswordInputComponent } from '../../shared/components/password-input/password-input.component';
import { DynamicSelectComponent } from '../../shared/components/dynamic-select/dynamic-select.component';
import { ToastService } from '../../core/services/toast.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-form-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule, 
    ButtonComponent, 
    InputComponent, 
    PasswordInputComponent,
    DynamicSelectComponent
  ],
  template: `
    <div class="overflow-y-auto flex-1 pb-8">
      <div class="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 class="text-xl font-bold text-gray-900">
            {{ isEditing() ? 'Editar Usuário' : 'Novo Usuário' }}
          </h1>
          <app-button variant="ghost" (onClick)="cancel()">
            Cancelar
          </app-button>
        </div>

        @if (isEditing() && isLoadingUser()) {
          <div class="p-8 text-center text-gray-500 text-sm italic">Carregando dados...</div>
        } @else {
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-8">
            <app-input
              label="Nome Completo"
              formControlName="name"
              placeholder="Ex: João Silva"
              [error]="getError('name')"
            ></app-input>

            <app-input
              label="Email"
              type="email"
              formControlName="email"
              placeholder="user@example.com"
              autocomplete="off"
              [error]="getError('email')"
            ></app-input>

            <app-password-input
              label="Senha"
              formControlName="password"
              autocomplete="new-password"
              [placeholder]="isEditing() ? 'Deixe em branco para manter a atual' : 'Senha de acesso'"
              [error]="getError('password')"
            ></app-password-input>

            <app-dynamic-select
              label="Perfil"
              formControlName="id_role"
              placeholder="Selecione um perfil"
              [fetchPage]="roleService.mageSelect"
              [fetchByIds]="roleService.mageHydrate"
              [getOptionLabel]="getRoleLabel"
              [getOptionValue]="getRoleValue"
              [searchFields]="['name']"
              [error]="getError('id_role')"
            ></app-dynamic-select>

            <div class="grid grid-cols-2 gap-6">
              <app-input
                label="Telefone"
                formControlName="phone"
                placeholder="+55 11 99999-9999"
                [error]="getError('phone')"
              ></app-input>

              <app-input
                label="Documento (CPF/CNPJ)"
                formControlName="document"
                placeholder="000.000.000-00"
                [error]="getError('document')"
              ></app-input>
            </div>

            <div class="pt-4 flex justify-end space-x-3">
              <app-button type="button" variant="secondary" (onClick)="cancel()">
                Cancelar
              </app-button>
              <app-button type="submit" [disabled]="isPending()">
                {{ isPending() ? 'Salvando...' : (isEditing() ? 'Atualizar Usuário' : 'Salvar Usuário') }}
              </app-button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
  /* v8 ignore stop */
})
export class UserFormPageComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private userService: UserService = inject(UserService);
  public roleService: RoleService = inject(RoleService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private toastService: ToastService = inject(ToastService);

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    id_role: ['', [Validators.required]],
    phone: [''],
    document: [''],
  });

  id = signal<string | null>(null);
  isEditing = signal(false);
  isLoadingUser = signal(false);
  isPending = signal(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && id !== 'new') {
        this.id.set(id);
        this.isEditing.set(true);
        this.loadUser(id);
      }
    });
  }

  async loadUser(id: string) {
    this.isLoadingUser.set(true);
    try {
      const user: User = await firstValueFrom(this.userService.getUser(id));
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        id_role: user.id_role,
        phone: user.phone || '',
        document: user.document || '',
        password: '',
      });
    } catch (error) {
      console.error('Error loading user', error);
      this.toastService.error('Erro ao carregar os dados do usuário.');
      this.router.navigate(['/users']);
    } finally {
      this.isLoadingUser.set(false);
    }
  }

  getRoleLabel = (role: Role) => role.name;
  getRoleValue = (role: Role) => role.id;

  getError(field: string): string | null {
    const control = this.userForm.get(field);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'Este campo é obrigatório';
      /* v8 ignore next */
      if (control.errors?.['email']) return 'Email inválido';
    }
    return null;
  }

  async onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (!this.isEditing() && !this.userForm.value.password) {
      this.toastService.error('Senha é obrigatória para novos usuários');
      return;
    }

    this.isPending.set(true);
    const data = { ...this.userForm.value };
    if (!data.password) delete data.password;

    try {
      if (this.isEditing()) {
        await firstValueFrom(this.userService.updateUser(this.id()!, data));
        this.toastService.success('Usuário atualizado com sucesso!');
      } else {
        await firstValueFrom(this.userService.createUser(data));
        this.toastService.success('Usuário cadastrado com sucesso!');
      }
      this.router.navigate(['/users']);
    } catch (error) {
      console.error('Error saving user', error);
      this.toastService.error('Ocorreu um erro ao salvar o usuário.');
    } finally {
      this.isPending.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/users']);
  }
}
