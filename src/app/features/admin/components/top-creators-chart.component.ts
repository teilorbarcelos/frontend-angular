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
import { UserProductStat } from '../dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-top-creators-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="col-span-3 rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="flex flex-col space-y-1.5 p-6">
        <h3 class="font-semibold text-gray-900 leading-none tracking-tight">
          Top Criadores (Produtos)
        </h3>
        <p class="text-sm text-gray-500">Usuários que mais cadastraram produtos.</p>
      </div>
      <div class="p-6 pt-0">
        <div class="h-[300px] w-full relative">
          <canvas #chartCanvas></canvas>
        </div>
      </div>
    </div>
  `,
})
export class TopCreatorsChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: UserProductStat[] = [];
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private isViewInit = false;
  private readonly colors = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

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

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const topData = this.data.slice(0, 5);
    const labels = topData.map((d) => d.userName || d.userId);
    const counts = topData.map((d) => d.count);
    const backgroundColors = topData.map((_, index) => this.colors[index % this.colors.length]);

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Quant.',
            data: counts,
            backgroundColor: backgroundColors,
            borderRadius: 4,
            barThickness: 12,
          },
        ],
      },
      options: {
        indexAxis: 'y',
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
            grid: { color: '#f0f0f0' },
            ticks: {
              color: '#6b7280',
              font: { size: 10 },
            },
          },
          y: {
            grid: { display: false },
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
