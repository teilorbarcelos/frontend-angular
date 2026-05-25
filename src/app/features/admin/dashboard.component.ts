import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { subDays } from 'date-fns';
import { LucideAngularModule, Loader2 } from 'lucide-angular';
import { DateRangePickerComponent } from '../../shared/components/date-range-picker/date-range-picker.component';
import { SummaryCardsComponent } from './components/summary-cards.component';
import { UserCreationsChartComponent } from './components/user-creations-chart.component';
import { TopCreatorsChartComponent } from './components/top-creators-chart.component';
import { ProductCreationsChartComponent } from './components/product-creations-chart.component';
import { DashboardService, DashboardStats } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    DateRangePickerComponent,
    SummaryCardsComponent,
    UserCreationsChartComponent,
    TopCreatorsChartComponent,
    ProductCreationsChartComponent,
  ],
  host: {
    class: 'flex-1 flex flex-col min-h-0 bg-gray-50 overflow-y-auto',
  },
  template: `
    <div class="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div class="flex items-center justify-between space-y-2">
        <h2 class="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <div class="flex items-center space-x-2">
          <app-date-range-picker
            [placeholder]="'Selecione o intervalo'"
            [ngModel]="dateRange()"
            (ngModelChange)="onDateRangeChange($event)"
            class="w-[300px]"
          ></app-date-range-picker>
        </div>
      </div>

      @if (isLoading()) {
        <div data-testid="loading-spinner" class="flex items-center justify-center h-[50vh]">
          <lucide-angular
            [img]="LoaderIcon"
            class="h-8 w-8 animate-spin text-indigo-600"
          ></lucide-angular>
        </div>
      } @else if (isError()) {
        <div class="flex items-center justify-center h-[50vh] text-red-500">
          <p>Erro ao carregar os dados do dashboard.</p>
        </div>
      } @else if (stats()) {
        <app-summary-cards
          [totalUsers]="totalUsers()"
          [totalProducts]="totalProducts()"
          class="block"
        ></app-summary-cards>

        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
          <app-user-creations-chart
            [data]="stats()!.userCreationStats"
            class="col-span-4 block"
          ></app-user-creations-chart>
          <app-top-creators-chart
            [data]="stats()!.productsPerUser"
            class="col-span-3 block"
          ></app-top-creators-chart>
          <app-product-creations-chart
            [data]="stats()!.productCreationStats"
            class="col-span-full block"
          ></app-product-creations-chart>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  private dashboardService = inject(DashboardService);

  readonly LoaderIcon = Loader2;

  dateRange = signal<{ start: string; end: string } | null>({
    start: subDays(new Date(), 30).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  stats = signal<DashboardStats | null>(null);
  isLoading = signal(false);
  isError = signal(false);

  totalUsers = computed(() => {
    const s = this.stats();
    if (!s) return 0;
    return s.userCreationStats.reduce((acc, curr) => acc + curr.count, 0);
  });

  totalProducts = computed(() => {
    const s = this.stats();
    if (!s) return 0;
    return s.productCreationStats.reduce((acc, curr) => acc + curr.count, 0);
  });

  constructor() {
    effect(() => {
      this.loadStats();
    });
  }

  onDateRangeChange(value: { start: string; end: string } | null) {
    this.dateRange.set(value);
  }

  private loadStats() {
    const range = this.dateRange();
    this.isLoading.set(true);
    this.isError.set(false);

    this.dashboardService.getStats(range?.start, range?.end).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.isError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
