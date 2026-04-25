import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Feature } from '../role.service';

@Component({
  selector: 'app-role-permissions-matrix',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-4">
      <h2 class="text-lg font-semibold text-gray-900">Matriz de Permissões</h2>
      <div class="overflow-x-auto rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feature</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ver</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Criar/Editar</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Deletar</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ativar/Inativar</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200" [formGroup]="parentForm">
            <ng-container formArrayName="permissions">
              @for (item of permissionsFormArray.controls; track item; let i = $index) {
                <tr [formGroupName]="i" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ getFeatureName(i) }}</div>
                    <div class="text-xs text-gray-500">{{ getFeatureDescription(i) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      formControlName="view"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      formControlName="create"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      formControlName="delete"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      formControlName="activate"
                      class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                  </td>
                </tr>
              }
            </ng-container>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class RolePermissionsMatrixComponent {
  @Input({ required: true }) parentForm!: FormGroup;
  @Input({ required: true }) features: Feature[] = [];

  get permissionsFormArray() {
    return this.parentForm.get('permissions') as FormArray;
  }

  getFeatureName(index: number): string {
    const idFeature = this.permissionsFormArray.at(index).get('id_feature')?.value;
    return this.features.find(f => f.id === idFeature)?.name || '';
  }

  getFeatureDescription(index: number): string {
    const idFeature = this.permissionsFormArray.at(index).get('id_feature')?.value;
    return this.features.find(f => f.id === idFeature)?.description || '';
  }
}
