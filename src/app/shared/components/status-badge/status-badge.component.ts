import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      (click)="onClick.emit()"
      [class]="classes"
      class="px-2 py-1 text-xs font-semibold rounded-full transition-colors focus:outline-none"
    >
      {{ active ? 'Ativo' : 'Inativo' }}
    </button>
  `,
})
export class StatusBadgeComponent {
  @Input() active = false;
  @Input() feature = '';
  @Output() onClick = new EventEmitter<void>();

  get classes() {
    return this.active
      ? 'bg-green-100 text-green-800 hover:bg-green-200'
      : 'bg-red-100 text-red-800 hover:bg-red-200';
  }
}
