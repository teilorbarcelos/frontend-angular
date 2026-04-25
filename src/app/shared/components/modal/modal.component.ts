import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-60 flex items-center justify-center p-4">
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-300"
          (click)="handleClose()"
          (keydown.enter)="handleClose()"
          tabindex="0"
          role="button"
          aria-label="Fechar modal"
        ></div>

        <!-- Modal Content -->
        <div
          class="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-300"
          (click)="$event.stopPropagation()"
          (keydown.enter)="$event.stopPropagation()"
          tabindex="0"
          role="dialog"
        >
          <header class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              <ng-content select="[title]"></ng-content>
            </h3>
            <button
              (click)="handleClose()"
              class="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <lucide-angular [img]="CloseIcon" class="w-5 h-5"></lucide-angular>
            </button>
          </header>

          <div class="px-6 py-4">
            <ng-content></ng-content>
          </div>

          <footer class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
            <ng-content select="[footer]"></ng-content>
          </footer>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  readonly CloseIcon = X;

  handleClose() {
    this.closed.emit();
  }
}
