import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-input',
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
      <input
        [id]="id"
        [type]="type"
        [step]="step"
        [placeholder]="placeholder"
        [formControl]="control"
        [attr.autocomplete]="autocomplete"
        (blur)="onTouched()"
        class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        [class.border-red-300]="error"
        [class.border-gray-300]="!error"
      />
      @if (error) {
        <p class="text-sm text-red-600">{{ error }}</p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      /* v8 ignore next 2: Boilerplate do Angular para forwardRef em providers standalone que não é capturado corretamente pelo coverage v8 em ambiente JSDOM */
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() id = '';
  @Input() type = 'text';
  @Input() step?: string;
  @Input() placeholder = '';
  @Input() error?: string | null;
  @Input() autocomplete = 'on';

  control = new FormControl();

  // ControlValueAccessor methods
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
