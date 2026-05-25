import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TimeSeriesStat {
  date: string;
  count: number;
}

export interface UserProductStat {
  userId: string;
  userName: string;
  count: number;
}

export interface DashboardStats {
  userCreationStats: TimeSeriesStat[];
  productCreationStats: TimeSeriesStat[];
  productsPerUser: UserProductStat[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private baseUrl = '/v1/dashboard/stats';

  getStats(startDate?: string, endDate?: string): Observable<DashboardStats> {
    const params: Record<string, string> = {};
    if (startDate) params['createdAt_start'] = startDate;
    if (endDate) params['createdAt_end'] = endDate;
    return this.http.get<DashboardStats>(this.baseUrl, { params });
  }
}
