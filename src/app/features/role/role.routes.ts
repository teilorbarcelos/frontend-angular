import { Routes } from '@angular/router';
import { RoleListPageComponent } from './role-list-page.component';
import { RoleFormPageComponent } from './role-form-page.component';

export const ROLE_ROUTES: Routes = [
  {
    path: '',
    component: RoleListPageComponent,
  },
  {
    path: 'new',
    component: RoleFormPageComponent,
  },
  {
    path: 'update/:id',
    component: RoleFormPageComponent,
  },
];
