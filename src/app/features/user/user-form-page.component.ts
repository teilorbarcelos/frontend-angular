import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, User } from './user.service';
import { RoleService, Role } from '../role/role.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { PasswordInputComponent } from '../../shared/components/password-input/password-input.component';
import { DynamicSelectComponent } from '../../shared/components/dynamic-select/dynamic-select.component';
import { ToastService } from '../../core/services/toast.service';
import { createFormPageController } from '../../core/utils/form-page.utils';

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
    DynamicSelectComponent,
  ],
  template: `
    <div class="overflow-y-auto flex-1 pb-8">
      <div
        class="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
      >
        <div class="flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 class="text-xl font-bold text-gray-900">
            {{ isEditing() ? 'Editar Usuário' : 'Novo Usuário' }}
          </h1>
          <app-button variant="ghost" (btnClick)="cancel()"> Cancelar </app-button>
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
              [placeholder]="
                isEditing() ? 'Deixe em branco para manter a atual' : 'Senha de acesso'
              "
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
              <app-button type="button" variant="secondary" (btnClick)="cancel()">
                Cancelar
              </app-button>
              <app-button type="submit" [disabled]="isPending()">
                {{
                  isPending() ? 'Salvando...' : isEditing() ? 'Atualizar Usuário' : 'Salvar Usuário'
                }}
              </app-button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class UserFormPageComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  public roleService = inject(RoleService);
  private toastService = inject(ToastService);

  userForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    id_role: ['', [Validators.required]],
    phone: [''],
    document: [''],
  });

  private formCtrl = createFormPageController<
    User,
    Omit<User, 'id' | 'active'> & { password?: string }
  >({
    feature: 'usuário',
    baseRoute: '/users',
    form: this.userForm,
    fetch: (id) => this.userService.getUser(id),
    create: (data) => this.userService.createUser(data),
    update: (id, data) => this.userService.updateUser(id, data),
    onLoadSuccess: (user) => {
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        id_role: user.id_role,
        phone: user.phone ?? '',
        document: user.document ?? '',
        password: '',
      });
    },
    onBeforeSave: (data) => {
      const typedData = data as Omit<User, 'id' | 'active'> & { password?: string };

      if (!this.isEditing() && !typedData.password) {
        this.toastService.error('A senha é obrigatória para novos usuários.');
        return null;
      }
      const finalData = { ...typedData };
      if (this.isEditing() && !finalData.password) {
        delete finalData.password;
      }
      return finalData;
    },
  });

  id = this.formCtrl.id;
  isEditing = this.formCtrl.isEditing;
  isLoadingUser = this.formCtrl.isLoading;
  isPending = this.formCtrl.isPending;

  getError = this.formCtrl.getError;
  onSubmit = this.formCtrl.onSubmit;
  cancel = this.formCtrl.cancel;

  ngOnInit() {
    this.formCtrl.init();
  }

  ngOnDestroy() {
    this.formCtrl.destroy();
  }

  getRoleLabel = (role: Role) => role.name;
  getRoleValue = (role: Role) => role.id;
}
