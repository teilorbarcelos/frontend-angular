import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit2,
  Filter,
  Home,
  Info,
  LayoutDashboard,
  LogOut,
  LUCIDE_ICONS,
  LucideIconProvider,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  User as UserIcon,
  Users
} from 'lucide-angular';

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor, authInterceptor])),
    provideAnimations(),
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({ 
        Home, 
        ChevronRight, 
        ChevronLeft,
        ChevronsLeft,
        ChevronsRight,
        ArrowUpDown,
        ArrowUp,
        ArrowDown,
        Pencil,
        Trash2,
        MoreHorizontal,
        LogOut, 
        UserIcon, 
        LayoutDashboard, 
        Users, 
        Shield, 
        Package,
        Search,
        Filter,
        Plus,
        Edit2,
        Calendar,
        CheckCircle,
        AlertCircle,
        Info,
        AlertTriangle
      })
    },
  ]
};
