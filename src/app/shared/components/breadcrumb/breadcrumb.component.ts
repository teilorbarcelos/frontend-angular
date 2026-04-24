import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { LucideAngularModule, ChevronRight, Home } from 'lucide-angular';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

const routeMap: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Usuários',
  roles: 'Perfis',
  products: 'Produtos',
  new: 'Novo',
  update: 'Editar',
};

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <nav class="flex mb-4" aria-label="Breadcrumb">
      <ol class="flex items-center space-x-2">
        <li>
          <a
            routerLink="/dashboard"
            class="text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <lucide-angular [img]="HomeIcon" class="w-4 h-4"></lucide-angular>
          </a>
        </li>

        @for (item of breadcrumbs(); track item.to) {
          <li class="flex items-center">
            <lucide-angular [img]="ChevronIcon" class="w-4 h-4 text-gray-400 mx-1 shrink-0"></lucide-angular>
            @if (item.isLast) {
              <span class="text-sm font-semibold text-indigo-600 truncate max-w-[200px]">
                {{ item.displayName }}
              </span>
            } @else {
              <a
                [routerLink]="item.to"
                class="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {{ item.displayName }}
              </a>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  private router = inject(Router);
  readonly HomeIcon = Home;
  readonly ChevronIcon = ChevronRight;

  private url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  breadcrumbs = computed(() => {
    const pathnames = this.url().split('/').filter((x) => x);
    return pathnames
      .map((value, index) => {
        if (index > 0 && pathnames[index - 1] === 'update') return null;

        const isLast =
          index === pathnames.length - 1 ||
          pathnames[index + 1] === undefined ||
          pathnames[index] === 'update';
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const displayName =
          routeMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

        return { to, displayName, isLast };
      })
      .filter((x): x is { to: string; displayName: string; isLast: boolean } => !!x);
  });
}
