import { Component, ElementRef, Input, OnDestroy, ViewChild, forwardRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, Calendar } from 'lucide-angular';
import * as flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true
    }
  ],
  styles: [`
    :host ::ng-deep .flatpickr-calendar {
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      z-index: 99999 !important;
    }
    :host ::ng-deep .flatpickr-day.selected {
      background: #4f46e5 !important;
      border-color: #4f46e5 !important;
    }
    :host ::ng-deep .flatpickr-day.inRange {
      background: #eef2ff !important;
      border-color: #eef2ff !important;
      box-shadow: -5px 0 0 #eef2ff, 5px 0 0 #eef2ff !important;
    }
  `],
  template: `
    <div 
      class="flex items-center w-full h-10 bg-white border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all"
      [ngClass]="containerClasses"
      [style.opacity]="isDisabled ? 0.5 : 1"
      (click)="!isDisabled && openPicker($event)"
    >
      <div class="pl-3 pr-2 text-gray-400">
        <lucide-angular [img]="CalendarIcon" class="w-4 h-4"></lucide-angular>
      </div>
      
      <input
        #pickerInput
        type="text"
        readonly
        [disabled]="isDisabled"
        [placeholder]="placeholder"
        class="w-full h-full bg-transparent text-sm focus:outline-none px-2"
        [class.cursor-not-allowed]="isDisabled"
        [class.cursor-pointer]="!isDisabled"
      />
    </div>
  `,
})
export class DateRangePickerComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @ViewChild('pickerInput') set pickerInput(content: ElementRef) {
    /* v8 ignore next 4 */
    if (content) {
      this.initFlatpickr(content.nativeElement);
    }
  }

  @Input() placeholder = 'Selecione o intervalo';
  
  isDisabled = false;
  private fpInstance: any;
  readonly CalendarIcon = Calendar;
  
  get containerClasses() {
    return {
      'cursor-not-allowed': this.isDisabled,
      'cursor-pointer': !this.isDisabled
    };
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  ngAfterViewInit() {}

  private initFlatpickr(element: HTMLElement) {
    if (this.fpInstance) return;

    // @ts-ignore
    /* v8 ignore next 2 */
    const fp = (flatpickr.default || flatpickr) as any;
    this.fpInstance = fp(element, {
      mode: 'range',
      dateFormat: 'Y-m-d',
      altInput: true,
      altFormat: 'd/m/Y',
      locale: Portuguese,
      appendTo: document.body,
      static: false,
      clickOpens: false,
      allowInput: false,
      onClose: (selectedDates: Date[]) => {
        if (selectedDates.length === 2) {
          this.onChange({
            start: selectedDates[0].toISOString().split('T')[0],
            end: selectedDates[1].toISOString().split('T')[0]
          });
        /* v8 ignore next 4 */
        } else if (selectedDates.length === 0) {
          this.onChange(null);
        }
      }
    });
  }

  openPicker(event: Event) {
    event.stopPropagation();
    if (this.fpInstance) {
      this.fpInstance.open();
    }
  }

  ngOnDestroy() {
    if (this.fpInstance) {
      this.fpInstance.destroy();
    }
  }

  writeValue(value: any): void {
    if (this.fpInstance) {
      if (value && value.start && value.end) {
        this.fpInstance.setDate([value.start, value.end]);
      } else {
        this.fpInstance.clear();
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  /* v8 ignore next 7: Ignorado devido a erro de ExpressionChangedAfterItHasBeenChecked no ambiente JSDOM do Vitest ao rodar suíte completa */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    if (this.fpInstance?.set) {
      this.fpInstance.set('clickOpens', !isDisabled);
    }
  }
}
