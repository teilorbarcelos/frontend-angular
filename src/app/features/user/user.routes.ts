import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  template: '<div class="p-6"><h1>Users List (Em breve)</h1></div>',
})
class PlaceholderComponent {}

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: PlaceholderComponent,
  },
];
