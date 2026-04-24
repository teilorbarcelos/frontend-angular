import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Filter as FilterIcon, X } from 'lucide-angular';

@Component({
  selector: 'app-filter-drawer',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Overlay -->
    @if (isOpen) {
      <div 
        class="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300"
        (click)="onClose.emit()"
      ></div>
    }

    <!-- Drawer -->
    <aside 
      class="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-60 flex flex-col transition-transform duration-300 transform"
      [class.translate-x-0]="isOpen"
      [class.translate-x-full]="!isOpen"
    >
      <header class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-2">
          <lucide-angular [img]="FilterIcon" class="w-5 h-5 text-indigo-600"></lucide-angular>
          <h2 class="text-lg font-semibold text-gray-900">{{ title }}</h2>
        </div>
        <button 
          (click)="onClose.emit()"
          class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <lucide-angular [img]="CloseIcon" class="w-5 h-5"></lucide-angular>
        </button>
      </header>

      <div class="flex-1 overflow-y-auto p-6">
        <ng-content></ng-content>
      </div>

      <footer class="p-6 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
        <button
          (click)="onClear.emit()"
          class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Limpar
        </button>
        <button
          (click)="onApply.emit()"
          class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          Aplicar
        </button>
      </footer>
    </aside>
  `,
})
export class FilterDrawerComponent {
  @Input() isOpen = false;
  @Input() title = 'Filtros Avançados';

  @Output() onClose = new EventEmitter<void>();
  @Output() onApply = new EventEmitter<void>();
  @Output() onClear = new EventEmitter<void>();

  readonly FilterIcon = FilterIcon;
  readonly CloseIcon = X;
}
