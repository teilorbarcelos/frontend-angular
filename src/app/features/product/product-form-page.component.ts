import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { ProductService, Product } from './product.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { createFormPageController } from '../../core/utils/form-page.utils';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  template: `
    <div class="overflow-y-auto flex-1 pb-8">
      <div class="max-w-2xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center justify-between border-b border-gray-200 pb-4">
          <h1 class="text-xl font-bold text-gray-900">
            {{ isEditing() ? 'Editar Produto' : 'Novo Produto' }}
          </h1>
          <app-button variant="ghost" (onClick)="cancel()">
            Cancelar
          </app-button>
        </div>

        @if (isEditing() && isLoadingProduct()) {
          <div class="p-8 text-center text-gray-500 text-sm italic">Carregando dados do produto...</div>
        } @else {
          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-8">
            <app-input
              label="Nome"
              formControlName="name"
              placeholder="Ex: Teclado Mecânico RGB"
              [error]="getError('name')"
            ></app-input>
            
            <div class="grid grid-cols-2 gap-6">
              <app-input
                label="SKU"
                formControlName="sku"
                placeholder="SKU-123"
                [error]="getError('sku')"
              ></app-input>

              <app-input
                label="Categoria"
                formControlName="category"
                placeholder="Ex: Periféricos"
                [error]="getError('category')"
              ></app-input>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <app-input
                label="Preço"
                type="number"
                step="0.01"
                formControlName="price"
                placeholder="0.00"
                [error]="getError('price')"
              ></app-input>

              <app-input
                label="Estoque"
                type="number"
                formControlName="stock"
                placeholder="0"
                [error]="getError('stock')"
              ></app-input>
            </div>

            <app-input
              label="Descrição"
              formControlName="description"
              placeholder="Descreva as principais características do produto"
              [error]="getError('description')"
            ></app-input>

            <div class="pt-4 flex justify-end space-x-3">
              <app-button type="button" variant="secondary" (onClick)="cancel()">
                Cancelar
              </app-button>
              <app-button type="submit" [disabled]="isPending()">
                {{ isPending() ? 'Salvando...' : (isEditing() ? 'Atualizar Produto' : 'Salvar Produto') }}
              </app-button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class ProductFormPageComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    sku: ['', [Validators.required]],
    category: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required]],
  });

  private formCtrl = createFormPageController<Product>({
    feature: 'produto',
    baseRoute: '/products',
    form: this.productForm,
    fetch: (id) => this.productService.getProduct(id),
    create: (data) => this.productService.createProduct(data),
    update: (id, data) => this.productService.updateProduct(id, data),
  });

  id = this.formCtrl.id;
  isEditing = this.formCtrl.isEditing;
  isLoadingProduct = this.formCtrl.isLoading;
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
}
