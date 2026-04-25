import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-angular';

export interface TableSort {
  orderBy?: string;
  orderDirection: 'asc' | 'desc' | undefined;
}

export interface HeaderMapItem<T> {
  title: string;
  keyItem: string;
  truncate?: boolean;
  sortable?: boolean;
  parseItem?: (value: any, item: T) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  host: {
    class: 'flex flex-col min-h-0'
  },
  template: `
    <div class="flex-none flex flex-col min-h-0 max-h-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div class="overflow-auto relative scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        @if (isLoading) {
          <div class="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }

        <table class="w-full text-left border-collapse min-w-[800px]">
          <thead class="bg-gray-50 sticky top-0 z-20">
            <tr>
              @for (col of headerMap; track col.keyItem) {
                <th 
                  class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200"
                  [class.cursor-pointer]="col.sortable"
                  [class.hover:bg-gray-100]="col.sortable"
                  (click)="handleSort(col)"
                >
                  <div class="flex items-center space-x-1">
                    <span>{{ col.title }}</span>
                    @if (col.sortable) {
                      <lucide-angular 
                        [img]="getSortIcon(col.keyItem)" 
                        class="w-3.5 h-3.5 text-gray-400"
                        [class.text-indigo-600]="sorting?.orderBy === col.keyItem"
                      ></lucide-angular>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            @for (item of data; track (item.id || $index)) {
              <tr class="hover:bg-gray-50 transition-colors">
                @for (col of headerMap; track col.keyItem) {
                  <td class="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    @if (cellTemplate) {
                      <ng-container 
                        *ngTemplateOutlet="cellTemplate; context: { $implicit: item, column: col, value: getValue(item, col.keyItem) }"
                      ></ng-container>
                    } @else if (col.parseItem) {
                       <div [innerHTML]="col.parseItem(getValue(item, col.keyItem), item)"></div>
                    } @else {
                      <div [class.truncate]="col.truncate" [class.max-w-xs]="col.truncate">
                        {{ getValue(item, col.keyItem) }}
                      </div>
                    }
                  </td>
                }
              </tr>
            } @empty {
              <tr>
                <td [attr.colspan]="headerMap.length" class="px-6 py-12 text-center text-gray-500 italic">
                  Nenhum registro encontrado.
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
        <div class="flex items-center space-x-6">
          <p class="text-sm text-gray-500 whitespace-nowrap">
            Exibindo <span class="font-semibold text-gray-900">{{ startRange }}</span> até 
            <span class="font-semibold text-gray-900">{{ endRange }}</span> de 
            <span class="font-semibold text-gray-900">{{ totalItems }}</span> resultados
          </p>

          <div class="flex items-center space-x-2">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Linhas:</span>
            <select 
              [value]="pageSize"
              (change)="handlePageSizeChange($event)"
              class="bg-white border border-gray-300 rounded-lg text-sm px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer hover:border-gray-400"
            >
              @for (size of pageSizeOptions; track size) {
                <option [value]="size" [selected]="size === pageSize">{{ size }}</option>
              }
            </select>
          </div>
        </div>

        <nav class="flex items-center space-x-1" aria-label="Pagination">
          <button 
            (click)="onPageChange.emit(0)"
            [disabled]="currentPage === 0"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Primeira página"
          >
            <lucide-angular [img]="ChevronsLeftIcon" class="w-5 h-5"></lucide-angular>
          </button>
          
          <button 
            (click)="onPageChange.emit(currentPage - 1)"
            [disabled]="currentPage === 0"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Anterior"
          >
            <lucide-angular [img]="ChevronLeftIcon" class="w-5 h-5"></lucide-angular>
          </button>
          
          <div class="flex items-center space-x-1 px-2">
            @for (page of pageNumbers; track $index) {
              @if (page === '...') {
                <span class="px-2 text-gray-400">...</span>
              } @else {
                <button
                  (click)="onPageChange.emit(+page)"
                  class="min-w-[36px] h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all cursor-pointer"
                  [class]="currentPage === +page 
                    ? 'bg-indigo-50 text-indigo-600 font-bold ring-1 ring-inset ring-indigo-500/20' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
                >
                  {{ +page + 1 }}
                </button>
              }
            }
          </div>

          <button 
            (click)="onPageChange.emit(currentPage + 1)"
            [disabled]="currentPage >= totalPages - 1"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Próximo"
          >
            <lucide-angular [img]="ChevronRightIcon" class="w-5 h-5"></lucide-angular>
          </button>
          
          <button 
            (click)="onPageChange.emit(totalPages - 1)"
            [disabled]="currentPage >= totalPages - 1"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="Última página"
          >
            <lucide-angular [img]="ChevronsRightIcon" class="w-5 h-5"></lucide-angular>
          </button>
        </nav>
      </div>
    </div>
  `,
})
export class DataTableComponent<T extends { id?: string }> {
  @Input() data: T[] = [];
  @Input() headerMap: HeaderMapItem<T>[] = [];
  @Input() isLoading = false;
  @Input() totalItems = 0;
  @Input() currentPage = 0;
  @Input() pageSize = 25;
  @Input() sorting?: TableSort;
  @Input() pageSizeOptions = [10, 25, 50, 100];

  @Output() onPageChange = new EventEmitter<number>();
  @Output() onPageSizeChange = new EventEmitter<number>();
  @Output() onSortChange = new EventEmitter<TableSort>();

  @ContentChild('cellTemplate') cellTemplate?: TemplateRef<any>;

  readonly ChevronsLeftIcon = ChevronsLeft;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly ChevronsRightIcon = ChevronsRight;

  get totalPages() {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const delta = 1;

    for (let i = 0; i < this.totalPages; i++) {
      if (
        i === 0 ||
        i === this.totalPages - 1 ||
        (i >= this.currentPage - delta && i <= this.currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === this.currentPage - delta - 1 && i > 0) ||
        (i === this.currentPage + delta + 1 && i < this.totalPages - 1)
      ) {
        pages.push('...');
      }
    }

    return pages.filter((v, i, a) => v !== '...' || a[i - 1] !== '...');
  }

  get startRange() {
    return this.totalItems === 0 ? 0 : this.currentPage * this.pageSize + 1;
  }

  get endRange() {
    return Math.min(this.totalItems, (this.currentPage + 1) * this.pageSize);
  }

  getValue(item: any, key: string) {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  }

  getSortIcon(key: string) {
    if (this.sorting?.orderBy !== key) return ArrowUpDown;
    return this.sorting.orderDirection === 'asc' ? ArrowUp : ArrowDown;
  }

  handleSort(col: HeaderMapItem<T>) {
    if (!col.sortable) return;

    let direction: 'asc' | 'desc' | undefined = 'asc';
    let orderBy: string | undefined = col.keyItem;

    if (this.sorting?.orderBy === col.keyItem) {
      if (this.sorting.orderDirection === 'asc') {
        direction = 'desc';
      /* v8 ignore start */
      } else if (this.sorting.orderDirection === 'desc') {
        direction = undefined;
        orderBy = undefined;
      /* v8 ignore stop */
      }
    }

    this.onSortChange.emit({ orderBy, orderDirection: direction });
  }

  handlePageSizeChange(event: Event) {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.onPageSizeChange.emit(size);
  }
}
