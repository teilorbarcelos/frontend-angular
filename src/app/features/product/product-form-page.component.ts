import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { 
  FormBuilder, 
  FormGroup, 
  ReactiveFormsModule, 
  Validators 
} from '@angular/forms';
import { ProductService, Product } from './product.service';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { ToastService } from '../../core/services/toast.service';
import { firstValueFrom } from 'rxjs';

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
export class ProductFormPageComponent implements OnInit {
  private fb: FormBuilder = inject(FormBuilder);
  private productService: ProductService = inject(ProductService);
  private router: Router = inject(Router);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private toastService: ToastService = inject(ToastService);

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    sku: ['', [Validators.required]],
    category: ['', [Validators.required]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required]],
  });

  id = signal<string | null>(null);
  isEditing = signal(false);
  isLoadingProduct = signal(false);
  isPending = signal(false);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && id !== 'new') {
        this.id.set(id);
        this.isEditing.set(true);
        this.loadProduct(id);
      }
    });
  }

  async loadProduct(id: string) {
    this.isLoadingProduct.set(true);
    try {
      const product: Product = await firstValueFrom(this.productService.getProduct(id));
      this.productForm.patchValue({
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        stock: product.stock,
        description: product.description,
      });
    } catch (error) {
      console.error('Error loading product', error);
      this.toastService.error('Erro ao carregar os dados do produto.');
      this.router.navigate(['/products']);
    } finally {
      this.isLoadingProduct.set(false);
    }
  }

  getError(field: string): string | null {
    const control = this.productForm.get(field);
    if (control && control.invalid && (control.dirty || control.touched)) {
      if (control.errors?.['required']) return 'Este campo é obrigatório';
      if (control.errors?.['min']) return 'Valor inválido';
    }
    return null;
  }

  async onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isPending.set(true);
    const data = this.productForm.value;

    try {
      if (this.isEditing()) {
        await firstValueFrom(this.productService.updateProduct(this.id()!, data));
        this.toastService.success('Produto atualizado com sucesso!');
      } else {
        await firstValueFrom(this.productService.createProduct(data));
        this.toastService.success('Produto cadastrado com sucesso!');
      }
      this.router.navigate(['/products']);
    } catch (error) {
      console.error('Error saving product', error);
      this.toastService.error('Ocorreu um erro ao salvar o produto.');
    } finally {
      this.isPending.set(false);
    }
  }

  cancel() {
    this.router.navigate(['/products']);
  }
}
