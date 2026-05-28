import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations'; // nosonar
import { provideRouter } from '@angular/router';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CircleAlert,
  CircleCheck,
  Funnel,
  House,
  Info,
  LayoutDashboard,
  LogOut,
  LUCIDE_ICONS,
  LucideIconProvider,
  Ellipsis,
  Package,
  Pen,
  Pencil,
  Plus,
  Search,
  Shield,
  Trash2,
  TriangleAlert,
  User as UserIcon,
  Users,
} from 'lucide-angular';

import { routes } from './app.routes';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor, authInterceptor])),
    provideAnimations(), // nosonar
    {
      provide: LUCIDE_ICONS,
      useValue: new LucideIconProvider({
        House,
        ChevronRight,
        ChevronLeft,
        ChevronsLeft,
        ChevronsRight,
        ArrowUpDown,
        ArrowUp,
        ArrowDown,
        Pencil,
        Trash2,
        Ellipsis,
        LogOut,
        UserIcon,
        LayoutDashboard,
        Users,
        Shield,
        Package,
        Search,
        Funnel,
        Plus,
        Pen,
        Calendar,
        CircleCheck,
        CircleAlert,
        Info,
        TriangleAlert,
      }),
    },
  ],
};
