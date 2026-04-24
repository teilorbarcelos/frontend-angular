import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private http = inject(HttpClient);
  private baseUrl = '/v1/role';

  getRoles(params: any): Observable<any> {
    return this.http.get(this.baseUrl, { params });
  }

  getRole(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createRole(data: any): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateRole(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  deleteRole(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
