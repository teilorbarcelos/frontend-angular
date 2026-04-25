import { HttpInterceptorFn, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

interface RefreshResponse {
  token: string;
  refreshToken: string;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const token = localStorage.getItem('token');

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLoginRequest = req.url.includes('/v1/auth/login');
      const isRefreshRequest = req.url.includes('/v1/auth/refresh');

      if (error.status === 401 && !isLoginRequest && !isRefreshRequest) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Nota: Para evitar loop infinito, o refresh também passará pelo apiInterceptor
          // mas não deve falhar com 401 recursivamente se o refresh token for válido.
          return http.post<RefreshResponse>('/v1/auth/refresh', { refreshToken }).pipe(
            switchMap((res) => {
              localStorage.setItem('token', res.token);
              localStorage.setItem('refreshToken', res.refreshToken);

              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${res.token}`,
                },
              });
              return next(retryReq);
            }),
            catchError((refreshError) => {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              router.navigate(['/login']);
              return throwError(() => refreshError);
            }),
          );
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    }),
  );
};
