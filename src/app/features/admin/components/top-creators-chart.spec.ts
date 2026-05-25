import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TopCreatorsChartComponent } from './top-creators-chart.component';
import { SimpleChange } from '@angular/core';
import { vi } from 'vitest';

vi.mock('chart.js', () => ({
  Chart: class {
    destroy = vi.fn();
    static register = vi.fn();
  },
  registerables: [],
}));

describe('TopCreatorsChartComponent', () => {
  let component: TopCreatorsChartComponent;
  let fixture: ComponentFixture<TopCreatorsChartComponent>;

  beforeEach(async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as any);

    await TestBed.configureTestingModule({
      imports: [TopCreatorsChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TopCreatorsChartComponent);
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
      { userId: '1', userName: 'User 1', count: 10 },
      { userId: '2', userName: '', count: 9 },
      { userId: '3', userName: 'User 3', count: 8 },
      { userId: '4', userName: 'User 4', count: 7 },
      { userId: '5', userName: 'User 5', count: 6 },
      { userId: '6', userName: 'User 6', count: 5 },
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
