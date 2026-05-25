import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { DashboardService } from './dashboard.service';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { FormsModule } from '@angular/forms';

vi.mock('chart.js', () => ({
  Chart: class {
    destroy = vi.fn();
    static register = vi.fn();
  },
  registerables: [],
}));

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockDashboardService: any;

  const mockStats = {
    userCreationStats: [
      { date: '2026-05-01', count: 5 },
      { date: '2026-05-02', count: 10 },
    ],
    productCreationStats: [
      { date: '2026-05-01', count: 2 },
      { date: '2026-05-02', count: 3 },
    ],
    productsPerUser: [{ userId: 'u1', userName: 'User One', count: 5 }],
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockDashboardService = {
      getStats: vi.fn().mockReturnValue(of(mockStats)),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, FormsModule],
      providers: [{ provide: DashboardService, useValue: mockDashboardService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create and load dashboard stats', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.stats()).toEqual(mockStats);
    expect(component.totalUsers()).toBe(15);
    expect(component.totalProducts()).toBe(5);
    expect(mockDashboardService.getStats).toHaveBeenCalled();
  });

  it('should render loading state correctly', async () => {
    fixture.detectChanges();
    component.isLoading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('[data-testid="loading-spinner"]')).toBeTruthy();
  });

  it('should render error state correctly', async () => {
    mockDashboardService.getStats.mockReturnValue(throwError(() => new Error('API Error')));

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.isError()).toBe(true);
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Erro ao carregar os dados do dashboard.');
  });

  it('should reload stats when date range changes', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    component.onDateRangeChange({ start: '2026-05-10', end: '2026-05-20' });
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockDashboardService.getStats).toHaveBeenLastCalledWith('2026-05-10', '2026-05-20');
  });
  it('should return 0 for totalUsers and totalProducts when stats is null', () => {
    expect(component.stats()).toBeNull();
    expect(component.totalUsers()).toBe(0);
    expect(component.totalProducts()).toBe(0);
  });
});
