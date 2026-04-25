import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService, Permission } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoading()) {
    // In a real app, you might want to wait for checkAuth to finish
    // but for simplicity we assume checkAuth is called at app init
  }

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const feature = route.data['feature'] as string;
  const action = route.data['action'] as keyof Omit<Permission, 'feature'>;

  if (feature && action && !authService.hasPermission(feature, action)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
