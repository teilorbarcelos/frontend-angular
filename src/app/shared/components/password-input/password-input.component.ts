import { Component, Input, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ControlValueAccessor, 
  NG_VALUE_ACCESSOR, 
  ReactiveFormsModule, 
  FormControl 
} from '@angular/forms';
import { LucideAngularModule, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  host: {
    class: 'block'
  },
  template: `
    <div class="space-y-1.5">
      @if (label) {
        <label [for]="id" class="block text-sm font-medium text-gray-700">
          {{ label }}
        </label>
      }
      <div class="relative">
        <input
          [id]="id"
          [type]="showPassword() ? 'text' : 'password'"
          [placeholder]="placeholder"
          [formControl]="control"
          [attr.autocomplete]="autocomplete"
          class="block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
          [class.border-red-300]="error"
          [class.border-gray-300]="!error"
        />
        <button
          type="button"
          (click)="togglePassword()"
          class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          tabindex="-1"
        >
          <lucide-angular 
            [img]="showPassword() ? EyeOffIcon : EyeIcon" 
            class="h-4 w-4"
          ></lucide-angular>
        </button>
      </div>
      @if (error) {
        <p class="text-sm text-red-600">{{ error }}</p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      /* v8 ignore next 2: Boilerplate do Angular para forwardRef em providers standalone que não é capturado corretamente pelo coverage */
      useExisting: forwardRef(() => PasswordInputComponent),
      multi: true,
    },
  ],
})
export class PasswordInputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() id = '';
  @Input() placeholder = '';
  @Input() error?: string | null;
  @Input() autocomplete = 'new-password';

  showPassword = signal(false);
  control = new FormControl();

  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  writeValue(value: any): void {
    this.control.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.control.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    // Implement if needed
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.control.disable() : this.control.enable();
  }
}
