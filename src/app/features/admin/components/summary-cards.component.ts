import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Users, Package } from 'lucide-angular';

@Component({
  selector: 'app-summary-cards',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div
        class="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-500">Novos Usuários</p>
          <h3 class="text-2xl font-bold text-gray-900">{{ totalUsers }}</h3>
        </div>
        <div
          class="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"
        >
          <lucide-angular [img]="UsersIcon" class="w-5 h-5"></lucide-angular>
        </div>
      </div>
      <div
        class="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-row items-center justify-between space-y-0 pb-2"
      >
        <div class="space-y-1">
          <p class="text-sm font-medium text-gray-500">Novos Produtos</p>
          <h3 class="text-2xl font-bold text-gray-900">{{ totalProducts }}</h3>
        </div>
        <div
          class="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600"
        >
          <lucide-angular [img]="PackageIcon" class="w-5 h-5"></lucide-angular>
        </div>
      </div>
    </div>
  `,
})
export class SummaryCardsComponent {
  @Input() totalUsers = 0;
  @Input() totalProducts = 0;

  readonly UsersIcon = Users;
  readonly PackageIcon = Package;
}
