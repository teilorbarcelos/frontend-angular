import { 
  Component, 
  Input, 
  forwardRef, 
  signal, 
  viewChild, 
  ElementRef, 
  AfterViewInit, 
  OnDestroy,
  effect,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MageSelectEngine, MageSelectEngineState } from 'mage-select-data-engine';
import { LucideAngularModule, ChevronDown, Search, Check, X } from 'lucide-angular';

@Component({
  selector: 'app-dynamic-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DynamicSelectComponent),
      multi: true,
    },
  ],
  template: `
    <div class="space-y-2 relative">
      @if (label) {
        <label class="text-sm font-medium text-gray-700">
          {{ label }}
        </label>
      }

      <div class="relative">
        <button
          type="button"
          (click)="toggleOpen()"
          [class.border-red-500]="error"
          class="w-full flex items-center justify-between font-normal bg-white h-10 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        >
          <span class="truncate" [class.text-gray-400]="!hasSelected()">
            {{ displayValue() }}
          </span>
          <lucide-angular [img]="ChevronDownIcon" class="h-4 w-4 opacity-50"></lucide-angular>
        </button>

        @if (isOpen()) {
          <div 
            class="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col max-h-[300px]"
          >
            <div class="flex items-center border-b px-3 bg-white">
              <lucide-angular [img]="SearchIcon" class="h-4 w-4 opacity-50 mr-2"></lucide-angular>
              <input
                #searchInput
                type="text"
                class="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-gray-400"
                placeholder="Pesquisar..."
                [formControl]="searchControl"
              />
            </div>

            <div class="overflow-y-auto flex-1 py-1" #scrollContainer>
              @if (state().items.length === 0 && !state().isLoading) {
                <div class="py-6 text-center text-sm text-gray-500">Nenhum resultado encontrado.</div>
              }

              @for (item of state().items; track getOptionValue(item)) {
                @let isSelected = isItemSelected(item);
                <div
                  (click)="handleSelect(item)"
                  class="relative flex w-full cursor-pointer select-none items-center py-2 px-3 text-sm outline-none transition-colors"
                  [class.bg-indigo-50]="isSelected"
                  [class.text-indigo-900]="isSelected"
                  [class.hover:bg-gray-100]="!isSelected"
                  [class.text-gray-700]="!isSelected"
                >
                  <div class="flex-1 truncate">
                    {{ getOptionLabel(item) }}
                  </div>
                  @if (isSelected) {
                    <lucide-angular [img]="CheckIcon" class="h-4 w-4 text-indigo-600 ml-2"></lucide-angular>
                  }
                </div>
              }

              @if (state().isLoading) {
                <div class="py-3 text-center flex items-center justify-center gap-2">
                  <div class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent"></div>
                  <span class="text-sm text-gray-500">Carregando...</span>
                </div>
              }
              
              <div #observerTarget class="h-1 w-full"></div>
            </div>
          </div>
        }
      </div>

      @if (multiple && state().selectedItems.length > 0) {
        <div class="flex flex-wrap gap-2 mt-2">
          @for (item of state().selectedItems; track getOptionValue(item)) {
            <div class="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md border border-indigo-100">
              {{ getOptionLabel(item) }}
              <button
                type="button"
                (click)="handleRemove(item)"
                class="hover:text-indigo-900 transition-colors p-0.5 rounded-full hover:bg-indigo-100"
              >
                <lucide-angular [img]="XIcon" class="h-3 w-3"></lucide-angular>
              </button>
            </div>
          }
        </div>
      }

      @if (error) {
        <p class="text-xs text-red-500 mt-1">{{ error }}</p>
      }
    </div>
  `,
})
export class DynamicSelectComponent<T extends { id: string | number }> implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @Input() label?: string;
  @Input() placeholder = "Selecione...";
  @Input() multiple = false;
  @Input() searchFields?: string[];
  @Input() startPage = 0;
  @Input() error?: string | null;

  @Input({ required: true }) fetchPage!: (page: number, search: string, options: { searchFields?: string[]; signal?: AbortSignal }) => Promise<{ items: T[]; hasMore: boolean }>;
  @Input({ required: true }) fetchByIds!: (ids: string[]) => Promise<T[]>;
  @Input({ required: true }) getOptionLabel!: (item: T) => string;
  @Input({ required: true }) getOptionValue!: (item: T) => string;

  isOpen = signal(false);
  state = signal<MageSelectEngineState<T>>({
    items: [],
    selectedItems: [],
    isLoading: false,
    isHydrating: false,
    hasMore: false,
    search: '',
    searchFields: [],
    page: 0,
    initialized: false,
    startPage: 0,
    hasPrevious: false,
  });

  searchControl = new FormControl('');
  private engine!: MageSelectEngine<T>;
  private observer?: IntersectionObserver;
  private observerTarget = viewChild<ElementRef>('observerTarget');

  readonly ChevronDownIcon = ChevronDown;
  readonly SearchIcon = Search;
  readonly CheckIcon = Check;
  readonly XIcon = X;

  constructor() {
    effect(() => {
      if (this.isOpen() && !this.state().initialized && !this.state().isLoading) {
        this.engine.initialLoad();
      }
    });

    this.searchControl.valueChanges.subscribe(val => {
      this.engine.setSearch(val || '');
    });
  }

  ngOnInit() {
    this.engine = new MageSelectEngine<T>({
      fetchPage: this.fetchPage,
      fetchByIds: this.fetchByIds,
      getId: this.getOptionValue,
      startPage: this.startPage,
      searchFields: this.searchFields,
    });

    this.engine.subscribe((newState: any) => {
      this.state.set(newState);
    });
  }

  ngAfterViewInit() {
    effect(() => {
      const target = this.observerTarget();
      if (target && this.isOpen()) {
        this.setupObserver(target.nativeElement);
      } else {
        this.cleanupObserver();
      }
    });
  }

  ngOnDestroy() {
    this.cleanupObserver();
  }

  private setupObserver(element: HTMLElement) {
    this.cleanupObserver();
    this.observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && this.state().hasMore && !this.state().isLoading) {
        this.engine.loadMore();
      }
    }, { threshold: 0.1 });
    this.observer.observe(element);
  }

  private cleanupObserver() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }

  toggleOpen() {
    this.isOpen.update(v => !v);
  }

  isItemSelected(item: T): boolean {
    return this.state().selectedItems.some((s: T) => this.getOptionValue(s) === this.getOptionValue(item));
  }

  handleSelect(item: T) {
    if (this.multiple) {
      this.engine.toggleSelection(item);
      this.onChange(this.state().selectedItems.map(this.getOptionValue));
    } else {
      this.engine.setValue([this.getOptionValue(item)]);
      this.onChange(this.getOptionValue(item));
      this.isOpen.set(false);
    }
  }

  handleRemove(item: T) {
    this.engine.toggleSelection(item);
    this.onChange(this.state().selectedItems.map(this.getOptionValue));
  }

  displayValue() {
    if (this.multiple) return this.placeholder;
    const selected = this.state().selectedItems[0];
    return selected ? this.getOptionLabel(selected) : this.placeholder;
  }

  hasSelected() {
    return this.state().selectedItems.length > 0;
  }

  // ControlValueAccessor implementation
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    if (this.engine) {
      const ids = Array.isArray(value) ? value : value ? [value] : [];
      this.engine.setValue(ids);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
