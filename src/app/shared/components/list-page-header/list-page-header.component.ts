import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Plus, Filter } from 'lucide-angular';
import { ButtonComponent } from '../button/button.component';
import { SearchInputComponent } from '../search-input/search-input.component';

@Component({
  selector: 'app-list-page-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent, SearchInputComponent],
  template: `
    <div class="flex items-center justify-between mb-6 shrink-0">
      <h1 class="text-2xl font-bold text-gray-900">{{ title }}</h1>
      <div class="flex items-center space-x-4">
        <app-search-input
          (searched)="searched.emit($event)"
          class="w-80"
          [placeholder]="searchPlaceholder"
        ></app-search-input>
        <app-button
          variant="secondary"
          (btnClick)="filterClick.emit()"
          [className]="filterCount > 0 ? 'border-indigo-500 text-indigo-600 bg-indigo-50' : ''"
        >
          <lucide-angular [img]="FilterIcon" class="w-4 h-4 mr-2"></lucide-angular>
          Filtros
          @if (filterCount > 0) {
            <span class="ml-2 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">
              {{ filterCount }}
            </span>
          }
        </app-button>
        @if (showCreate) {
          <app-button (btnClick)="createClick.emit()">
            <lucide-angular [img]="PlusIcon" class="w-4 h-4 mr-2"></lucide-angular>
            {{ createLabel }}
          </app-button>
        }
      </div>
    </div>
  `,
})
export class ListPageHeaderComponent {
  @Input() title = '';
  @Input() filterCount = 0;
  @Input() createLabel = 'Novo';
  @Input() searchPlaceholder = 'Search...';
  @Input() showCreate = false;

  @Output() searched = new EventEmitter<string>();
  @Output() filterClick = new EventEmitter<void>();
  @Output() createClick = new EventEmitter<void>();

  readonly PlusIcon = Plus;
  readonly FilterIcon = Filter;
}
