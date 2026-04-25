import { Routes } from '@angular/router';
import { ProductListPageComponent } from './product-list-page.component';
import { ProductFormPageComponent } from './product-form-page.component';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    component: ProductListPageComponent,
  },
  {
    path: 'new',
    component: ProductFormPageComponent,
  },
  {
    path: 'update/:id',
    component: ProductFormPageComponent,
  },
];
