import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { TimeSeriesStat } from '../dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-product-creations-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-span-full rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-col space-y-1.5 p-6">
        <h3 class="font-semibold text-gray-900 leading-none tracking-tight">Criação de Produtos</h3>
        <p class="text-sm text-gray-500">Volume de produtos cadastrados por dia.</p>
      </div>
      <div class="p-6 pt-0">
        <div class="h-[300px] w-full relative">
          <canvas #chartCanvas></canvas>
        </div>
      </div>
    </div>
  `,
})
export class ProductCreationsChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: TimeSeriesStat[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private isViewInit = false;

  ngAfterViewInit() {
    this.isViewInit = true;
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.isViewInit) {
      this.renderChart();
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private renderChart() {
    if (!this.chartCanvas) return;
    if (this.chart) {
      this.chart.destroy();
    }

    const formatDateLabel = (dateStr: string) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.data.map((d) => formatDateLabel(d.date));
    const counts = this.data.map((d) => d.count);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Quant.',
            data: counts,
            backgroundColor: '#6366f1',
            borderRadius: 4,
            barThickness: 24,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 8,
            backgroundColor: '#ffffff',
            titleColor: '#111827',
            bodyColor: '#4b5563',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            displayColors: false,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
              maxRotation: 45,
              minRotation: 45,
            },
          },
          y: {
            grace: '10%',
            grid: { color: '#f0f0f0' },
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
            },
          },
        },
      },
    });
  }
}
