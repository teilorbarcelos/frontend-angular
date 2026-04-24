import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: '<div class="p-6"><h1>Roles List (Em breve)</h1></div>',
})
class PlaceholderComponent {}

export const ROLE_ROUTES: Routes = [
  {
    path: '',
    component: PlaceholderComponent,
  },
];
