import { TestBed, ComponentFixture } from '@angular/core/testing';
import { UserCreationsChartComponent } from './user-creations-chart.component';
import { SimpleChange } from '@angular/core';
import { vi } from 'vitest';

vi.mock('chart.js', () => ({
  Chart: class {
    destroy = vi.fn();
    static register = vi.fn();
  },
  registerables: [],
}));

describe('UserCreationsChartComponent', () => {
  let component: UserCreationsChartComponent;
  let fixture: ComponentFixture<UserCreationsChartComponent>;

  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      createLinearGradient: () => ({
        addColorStop: vi.fn(),
      }),
    } as any);

    await TestBed.configureTestingModule({
      imports: [UserCreationsChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCreationsChartComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create and render chart', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect((component as any).chart).toBeTruthy();
  });

  it('should call ngOnChanges and render chart on data change', () => {
    fixture.detectChanges();
    const data = [
      { date: '2026-05-01', count: 10 },
      { date: '', count: 5 },
      { date: '2026-05', count: 2 },
    ];
    component.data = data;
    component.ngOnChanges({
      data: new SimpleChange(null, data, false),
    });
    expect(component).toBeTruthy();
  });

  it('should destroy previous chart when rendering a new one', () => {
    fixture.detectChanges();
    const firstChart = (component as any).chart;
    expect(firstChart).toBeTruthy();
    const destroySpy = vi.spyOn(firstChart, 'destroy');

    component.ngOnChanges({
      data: new SimpleChange(null, [], false),
    });

    expect(destroySpy).toHaveBeenCalled();
  });

  it('should handle destroy gracefully', () => {
    fixture.detectChanges();
    const chartInstance = (component as any).chart;
    expect(chartInstance).toBeTruthy();
    const destroySpy = vi.spyOn(chartInstance, 'destroy');
    component.ngOnDestroy();
    expect(destroySpy).toHaveBeenCalled();
  });

  it('should return early from renderChart if chartCanvas is not set', () => {
    (component as any).chartCanvas = undefined;
    (component as any).renderChart();
    expect((component as any).chart).toBeUndefined();
  });

  it('should return early from renderChart if ctx is null', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    (component as any).renderChart();
    expect((component as any).chart).toBeUndefined();
  });
});
