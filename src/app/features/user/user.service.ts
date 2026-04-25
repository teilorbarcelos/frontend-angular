import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  avatar?: string;
  id_role: string;
  active: boolean;
}

export interface UserResponse {
  items: User[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = '/v1/user';

  getUsers(options: {
    page?: number;
    size?: number;
    searchWord?: string;
    searchFields?: string[];
    filters?: Record<string, unknown>;
    sort?: { orderBy?: string; orderDirection?: string };
    all?: boolean;
  }): Observable<UserResponse> {
    const { page = 0, size = 25, searchWord, searchFields, filters = {}, sort, all } = options;

    const params: Record<string, string | number | boolean> = {
      page,
      size,
      ...(filters as Record<string, string | number | boolean>),
    };

    if (searchWord) {
      params['searchWord'] = searchWord;
      if (searchFields) {
        params['searchFields'] = searchFields.join(',');
      }
    }

    if (sort?.orderBy) {
      params['orderBy'] = sort.orderBy;
      if (sort.orderDirection) {
        params['orderDirection'] = sort.orderDirection;
      }
    }

    const url = all ? `${this.baseUrl}/all` : this.baseUrl;
    return this.http.get<UserResponse>(url, { params });
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  createUser(data: Omit<User, 'id' | 'active'> & { password?: string }): Observable<User> {
    return this.http.post<User>(this.baseUrl, data);
  }

  updateUser(id: string, data: Partial<User> & { password?: string }): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  toggleStatus(id: string, active: boolean): Observable<unknown> {
    return this.http.patch(`${this.baseUrl}/${id}/status`, { active });
  }
}
