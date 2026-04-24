import { Routes } from '@angular/router';
import { UserListPageComponent } from './user-list-page.component';
import { UserFormPageComponent } from './user-form-page.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserListPageComponent,
  },
  {
    path: 'new',
    component: UserFormPageComponent,
  },
  {
    path: 'update/:id',
    component: UserFormPageComponent,
  },
];
