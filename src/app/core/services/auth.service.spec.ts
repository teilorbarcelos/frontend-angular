import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, User } from './auth.service';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('provides authentication status when token exists', async () => {
    localStorage.setItem('token', 'valid-token');
    const user: User = { 
      id: '1', 
      name: 'John', 
      email: 'john@test.com',
      role: { id: '1', name: 'Admin', permissions: [] } 
    };

    const promise = service.checkAuth();
    
    const req = httpMock.expectOne('/v1/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush({ user });

    await promise;

    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()).toEqual(user);
  });

  it('handles login and logout', () => {
    const user: User = { 
      id: '1', 
      name: 'John', 
      email: 'john@test.com',
      role: { id: '1', name: 'Admin', permissions: [] } 
    };

    service.login('token123', 'refresh123', user);
    expect(service.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('token')).toBe('token123');
    expect(localStorage.getItem('refreshToken')).toBe('refresh123');
    expect(localStorage.getItem('user')).toBe(JSON.stringify(user));

    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('handles API error by clearing tokens', async () => {
    localStorage.setItem('token', 'invalid-token');
    
    const promise = service.checkAuth();
    
    const req = httpMock.expectOne('/v1/auth/me');
    req.error(new ProgressEvent('error'));

    await promise;

    expect(localStorage.getItem('token')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('checks permissions correctly', () => {
    const user: User = { 
      id: '1', 
      name: 'John', 
      email: 'john@test.com',
      role: { 
        id: '1',
        name: 'Admin',
        permissions: [{ feature: 'users', view: true, create: true, delete: false, activate: true }] 
      } 
    };

    service.login('token123', 'refresh123', user);

    expect(service.hasPermission('users', 'create')).toBe(true);
    expect(service.hasPermission('users', 'delete')).toBe(false);
    expect(service.hasPermission('roles', 'view')).toBe(false);
  });

  it('handles user without role or permissions', () => {
    const user: any = { id: '1', name: 'John', role: null };
    service.login('token123', 'refresh123', user);
    expect(service.hasPermission('users', 'view')).toBe(false);

    const user2: any = { id: '2', name: 'Jane', role: { permissions: null } };
    service.login('token123', 'refresh123', user2);
    expect(service.hasPermission('users', 'view')).toBe(false);
  });

  it('returns false for hasPermission when user is not logged in', () => {
    expect(service.hasPermission('users', 'create')).toBe(false);
  });
});
