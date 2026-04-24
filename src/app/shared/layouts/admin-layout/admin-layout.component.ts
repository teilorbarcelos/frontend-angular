import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { 
  LucideAngularModule, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  Users, 
  Shield, 
  Package 
} from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { ToastContainerComponent } from '../../components/toast-container/toast-container.component';
import { ActionMenuPortalComponent } from '../../components/action-menu-portal/action-menu-portal.component';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, BreadcrumbComponent, ToastContainerComponent, ActionMenuPortalComponent],
  template: `
    <app-toast-container></app-toast-container>
    <app-action-menu-portal></app-action-menu-portal>
    <div class="flex h-screen w-full bg-gray-50">
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div class="h-16 flex items-center px-6 border-b border-gray-200 shrink-0">
          <span class="text-xl font-bold text-gray-800">Admin Panel</span>
        </div>
        <nav class="flex-1 p-4 space-y-1">
          @for (item of navItems(); track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-indigo-50 text-indigo-700 font-medium"
              [routerLinkActiveOptions]="{ exact: false }"
              class="flex items-center px-4 py-2 rounded-md transition-colors text-gray-700 hover:bg-gray-100"
              [class.bg-indigo-50]="isActive(item.path)"
              [class.text-indigo-700]="isActive(item.path)"
              [class.font-medium]="isActive(item.path)"
            >
              <lucide-angular [img]="item.icon" class="w-5 h-5 mr-3"></lucide-angular>
              {{ item.name }}
            </a>
          }
        </nav>
      </aside>
      <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6 space-x-4">
          <div class="flex items-center space-x-2 text-gray-600">
            <lucide-angular [img]="UserIcon" class="w-5 h-5"></lucide-angular>
            <span class="text-sm font-medium">{{ authService.user()?.name || 'User' }}</span>
          </div>
          <button
            (click)="handleLogout()"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            title="Sair"
          >
            <lucide-angular [img]="LogOutIcon" class="w-5 h-5"></lucide-angular>
          </button>
        </header>
        <div class="flex-1 flex flex-col min-h-0 p-6 overflow-hidden">
          <app-breadcrumb class="shrink-0 mb-4"></app-breadcrumb>
          <div class="flex-1 flex flex-col min-h-0">
            <router-outlet></router-outlet>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  readonly LogOutIcon = LogOut;
  readonly UserIcon = UserIcon;

  navItems = () => [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, feature: 'dashboard' },
    { name: 'Perfis', path: '/roles', icon: Shield, feature: 'role' },
    { name: 'Usuários', path: '/users', icon: Users, feature: 'user' },
    { name: 'Produtos', path: '/products', icon: Package, feature: 'product' },
  ].filter(item => !item.feature || this.authService.hasPermission(item.feature, 'view'));

  isActive(path: string) {
    return this.router.url.startsWith(path);
  }

  handleLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
