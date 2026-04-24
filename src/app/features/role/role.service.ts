import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

export interface RoleFeature {
  id_feature: string;
  create: boolean;
  view: boolean;
  delete: boolean;
  activate: boolean;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  active: boolean;
  RoleFeature: RoleFeature[];
}

export interface RoleResponse {
  items: Role[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);
  private baseUrl = '/v1/role';

  getRoles(options: {
    page?: number;
    size?: number;
    searchWord?: string;
    searchFields?: string[];
    filters?: Record<string, unknown>;
    sort?: { orderBy?: string; orderDirection?: string };
    all?: boolean;
  }): Observable<RoleResponse> {
    const { page = 0, size = 25, searchWord, searchFields, filters = {}, sort, all } = options;
    
    const params: any = {
      page,
      size,
      ...filters,
    };

    if (searchWord) {
      params.searchWord = searchWord;
      if (searchFields) {
        params.searchFields = searchFields.join(',');
      }
    }

    if (sort?.orderBy) {
      params.orderBy = sort.orderBy;
      params.orderDirection = sort.orderDirection;
    }

    const url = all ? `${this.baseUrl}/all` : this.baseUrl;
    return this.http.get<RoleResponse>(url, { params });
  }

  getRole(id: string): Observable<Role> {
    return this.http.get<Role>(`${this.baseUrl}/${id}`);
  }

  getFeatures(): Observable<Feature[]> {
    return this.http.get<Feature[]>(`${this.baseUrl}/features`);
  }

  createRole(data: { name: string; description: string; permissions: RoleFeature[] }): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateRole(id: string, data: { name: string; description: string; permissions: RoleFeature[] }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  toggleStatus(id: string, active: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/status`, { active });
  }

  // DynamicSelect Helpers
  mageSelect = async (page: number, query: string, options: { searchFields?: string[] }) => {
    const size = 10;
    const res = await firstValueFrom(this.getRoles({
      page,
      size,
      searchWord: query,
      searchFields: options.searchFields
    }));
    
    return {
      items: res.items as Role[],
      hasMore: (page + 1) * size < res.total
    };
  };

  mageHydrate = async (ids: string[]): Promise<Role[]> => {
    if (!ids.length) return [];
    const roles = await Promise.all(
      ids.map(id => firstValueFrom(this.getRole(id)).catch(() => null))
    );
    return roles.filter(Boolean) as Role[];
  };
}
