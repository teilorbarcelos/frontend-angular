import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface Permission {
  feature: string;
  view: boolean;
  create: boolean;
  delete: boolean;
  activate: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
    permissions: Permission[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private userState = signal<User | null>(null);
  private loadingState = signal<boolean>(true);

  user = this.userState.asReadonly();
  isLoading = this.loadingState.asReadonly();
  isAuthenticated = computed(() => !!this.userState());

  constructor() {
    this.hydrate();
  }

  private hydrate() {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        this.userState.set(JSON.parse(savedUser));
        this.loadingState.set(false);
      } catch {
        this.logout();
      }
    }
  }

  async checkAuth() {
    this.loadingState.set(true);
    const token = localStorage.getItem('token');

    if (!token) {
      this.logout();
      return;
    }

    try {
      const res = await firstValueFrom(this.http.get<{ user: User }>('/v1/auth/me'));
      this.setSession(token, localStorage.getItem('refreshToken') ?? '', res.user);
    } catch {
      this.logout();
    } finally {
      this.loadingState.set(false);
    }
  }

  login(token: string, refreshToken: string, user: User) {
    this.setSession(token, refreshToken, user);
  }

  private setSession(token: string, refreshToken: string, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    this.userState.set(user);
    this.loadingState.set(false);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.userState.set(null);
    this.loadingState.set(false);
  }

  hasPermission(feature: string, action: keyof Omit<Permission, 'feature'>): boolean {
    const user = this.userState();
    if (!user?.role) return false;
    const permissions = user.role.permissions || [];
    const permission = permissions.find((p) => p.feature === feature);
    return permission ? !!permission[action] : false;
  }
}
