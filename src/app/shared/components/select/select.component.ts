import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';

export interface SelectOption {
  label: string;
  value: unknown;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  host: {
    class: 'block',
  },
  template: `
    <div class="space-y-1.5">
      @if (label) {
        <label [for]="id" class="block text-sm font-medium text-gray-700">
          {{ label }}
        </label>
      }
      <select
        [id]="id"
        [formControl]="control"
        (blur)="onTouched()"
        class="block w-full h-10 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
        [class.border-red-300]="error"
      >
        @if (placeholder) {
          <option value="">{{ placeholder }}</option>
        }
        @for (option of options; track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </select>
      @if (error) {
        <p class="text-sm text-red-600">{{ error }}</p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      /* v8 ignore next 2: Boilerplate do Angular para forwardRef em providers standalone que não é capturado corretamente pelo coverage */
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() id = '';
  @Input() placeholder = '';
  @Input() options: SelectOption[] = [];
  @Input() error?: string | null;

  control = new FormControl();

  onTouched: () => void = () => {
    // ControlValueAccessor method
  };

  writeValue(value: unknown): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.control.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable();
    } else {
      this.control.enable();
    }
  }
}
