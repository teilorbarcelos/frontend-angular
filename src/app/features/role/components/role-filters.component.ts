import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FilterDrawerComponent } from '../../../shared/components/filter-drawer/filter-drawer.component';
import { DateRangePickerComponent } from '../../../shared/components/date-range-picker/date-range-picker.component';

@Component({
  selector: 'app-role-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilterDrawerComponent, DateRangePickerComponent],
  template: `
    <app-filter-drawer
      [isOpen]="isOpen"
      title="Filtros de Perfis"
      (closed)="closed.emit()"
      (cleared)="handleClear()"
      (applied)="handleApply()"
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
          <app-date-range-picker formControlName="createdAt"></app-date-range-picker>
        </div>
      </form>
    </app-filter-drawer>
  `,
})
export class RoleFiltersComponent implements OnInit, OnChanges {
  private fb = inject(FormBuilder);

  @Input() isOpen = false;
  @Input() initialValues: Record<string, unknown> = {};

  @Output() closed = new EventEmitter<void>();
  @Output() filtered = new EventEmitter<Record<string, unknown>>();

  filterForm: FormGroup = this.fb.group({
    active: [''],
    createdAt: [{ start: '', end: '' }],
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
      active: (this.initialValues['active'] as string) || '',
      createdAt: {
        start: (this.initialValues['createdAt_start'] as string) || '',
        end: (this.initialValues['createdAt_end'] as string) || '',
      },
    };
    this.filterForm.patchValue(values, { emitEvent: false });
  }

  handleClear() {
    this.filterForm.patchValue({
      active: '',
      createdAt: { start: '', end: '' },
    });
    this.filtered.emit({});
    this.closed.emit();
  }

  handleApply() {
    const val = this.filterForm.value;
    const cleanValues: Record<string, unknown> = {};

    if (val.active !== '') cleanValues['active'] = val.active;
    if (val.createdAt?.start) cleanValues['createdAt_start'] = val.createdAt.start;
    if (val.createdAt?.end) cleanValues['createdAt_end'] = val.createdAt.end;

    this.filtered.emit(cleanValues);
    this.closed.emit();
  }
}
