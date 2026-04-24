import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginPageComponent } from './features/auth/login-page.component';
import { AdminLayoutComponent } from './shared/layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'roles',
        data: { feature: 'role', action: 'view' },
        loadChildren: () => import('./features/role/role.routes').then(m => m.ROLE_ROUTES),
      },
      {
        path: 'users',
        data: { feature: 'user', action: 'view' },
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES),
      },
      {
        path: 'products',
        data: { feature: 'product', action: 'view' },
        loadChildren: () => import('./features/product/product.routes').then(m => m.PRODUCT_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
