import { Component, Input, Output, EventEmitter, inject, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FilterDrawerComponent } from '../../../shared/components/filter-drawer/filter-drawer.component';
import { DateRangePickerComponent } from '../../../shared/components/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-product-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilterDrawerComponent, DateRangePickerComponent],
  template: `
    <app-filter-drawer
      [isOpen]="isOpen"
      title="Filtros de Produtos"
      (onClose)="onClose.emit()"
      (onClear)="handleClear()"
      (onApply)="handleApply()"
    >
      <form [formGroup]="filterForm" class="space-y-6">
        <div class="space-y-2">
          <label for="active" class="text-sm font-medium text-gray-700">Status</label>
          <select
            id="active"
            formControlName="active"
            class="w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        <div class="space-y-2">
          <label for="createdAt" class="text-sm font-medium text-gray-700">Data de Criação</label>
          <app-date-range-picker
            formControlName="createdAt"
          ></app-date-range-picker>
        </div>
      </form>
    </app-filter-drawer>
  `,
})
export class ProductFiltersComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() initialValues: Record<string, any> = {};

  @Output() onClose = new EventEmitter<void>();
  @Output() onFilter = new EventEmitter<Record<string, any>>();

  filterForm: FormGroup = this.fb.group({
    active: [''],
    createdAt: [{ start: '', end: '' }]
  });

  ngOnInit() {
    this.updateFormValues();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['initialValues'] && this.initialValues) {
      this.updateFormValues();
    }
  }

  private updateFormValues() {
    const values = {
      active: this.initialValues['active'] || '',
      createdAt: {
        start: this.initialValues['createdAt_start'] || '',
        end: this.initialValues['createdAt_end'] || ''
      }
    };
    this.filterForm.patchValue(values, { emitEvent: false });
  }

  handleClear() {
    this.filterForm.patchValue({
      active: '',
      createdAt: { start: '', end: '' }
    });
    this.onFilter.emit({});
    this.onClose.emit();
  }

  handleApply() {
    const val = this.filterForm.value;
    const cleanValues: any = {};

    if (val.active !== '') cleanValues.active = val.active;
    if (val.createdAt?.start) cleanValues.createdAt_start = val.createdAt.start;
    if (val.createdAt?.end) cleanValues.createdAt_end = val.createdAt.end;

    this.onFilter.emit(cleanValues);
    this.onClose.emit();
  }
}
