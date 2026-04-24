import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  active: boolean;
}

export interface ProductResponse {
  items: Product[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private baseUrl = '/v1/product';

  getProducts(options: {
    page?: number;
    size?: number;
    searchWord?: string;
    searchFields?: string[];
    filters?: Record<string, any>;
    sort?: { orderBy?: string; orderDirection?: string };
    all?: boolean;
  }): Observable<ProductResponse> {
    const { page = 0, size = 25, searchWord, searchFields, filters = {}, sort, all } = options;
    
    let params: any = { page, size, ...filters };

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
    return this.http.get<ProductResponse>(url, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${id}`);
  }

  createProduct(data: Omit<Product, 'id' | 'active'>): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, data);
  }

  updateProduct(id: string, data: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.baseUrl}/${id}`, data);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  toggleStatus(id: string, active: boolean): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/status`, { active });
  }
}
