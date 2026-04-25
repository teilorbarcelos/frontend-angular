import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="p-6">
      <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p class="mt-4 text-gray-600">Bem-vindo ao painel administrativo.</p>
    </div>
  `,
})
export class DashboardComponent {}
