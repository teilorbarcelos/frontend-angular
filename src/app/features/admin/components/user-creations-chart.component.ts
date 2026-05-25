import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { TimeSeriesStat } from '../dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-user-creations-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-span-4 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-col space-y-1.5 p-6">
        <h3 class="font-semibold text-gray-900 leading-none tracking-tight">Criação de Usuários</h3>
        <p class="text-sm text-gray-500">Evolução diária de registros no período.</p>
      </div>
      <div class="p-6 pt-0">
        <div class="h-[300px] w-full relative">
          <canvas #chartCanvas></canvas>
        </div>
      </div>
    </div>
  `,
})
export class UserCreationsChartComponent implements OnChanges, AfterViewInit, OnDestroy {
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

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.2)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Quant.',
            data: counts,
            borderColor: '#4f46e5',
            borderWidth: 2,
            fill: true,
            backgroundColor: gradient,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
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
