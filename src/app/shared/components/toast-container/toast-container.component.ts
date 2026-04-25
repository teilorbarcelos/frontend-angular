import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  CircleAlert,
  TriangleAlert,
  CircleCheck,
  Info,
  LucideAngularModule,
  X
} from 'lucide-angular';
import { ToastService, ToastType } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  styles: [`
    @keyframes toast-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes toast-out {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes progress {
      from { width: 100%; }
      to { width: 0%; }
    }

    .toast-enter {
      animation: toast-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .toast-exit {
      animation: toast-out 0.3s ease-in forwards;
    }
    .animate-progress {
      animation: progress linear forwards;
    }
  `],
  template: `
    <div class="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-100 flex flex-col gap-3 w-[calc(100%-2rem)] sm:w-full sm:max-w-sm pointer-events-none">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto relative flex items-start gap-3 p-4 rounded-xl shadow-lg border bg-white overflow-hidden"
          [ngClass]="[
            getTypeClasses(toast.type),
            toast.isClosing ? 'toast-exit' : 'toast-enter'
          ]"
        >
          <div class="shrink-0 pt-0.5">
            <lucide-angular [img]="getIcon(toast.type)" class="w-5 h-5"></lucide-angular>
          </div>
          
          <div class="flex-1 text-sm font-medium wrap-break-word leading-relaxed">
            {{ toast.message }}
          </div>

          <button 
            (click)="toastService.remove(toast.id)"
            class="shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors text-gray-400 hover:text-gray-600"
          >
            <lucide-angular [img]="CloseIcon" class="w-4 h-4"></lucide-angular>
          </button>

          <!-- Progress Bar -->
          @if (toast.duration && toast.duration > 0 && !toast.isClosing) {
            <div 
              class="absolute bottom-0 left-0 h-1 opacity-20 animate-progress"
              [ngClass]="getProgressBarClasses(toast.type)"
              [style.animationDuration.ms]="toast.duration"
            ></div>
          }
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
  
  readonly CloseIcon = X;

  getIcon(type: ToastType) {
    switch (type) {
      case 'success': return CircleCheck;
      case 'error': return CircleAlert;
      case 'warning': return TriangleAlert;
      default: return Info;
    }
  }

  getProgressBarClasses(type: ToastType) {
    switch (type) {
      case 'success': return 'bg-emerald-600';
      case 'error': return 'bg-red-600';
      case 'warning': return 'bg-amber-600';
      default: return 'bg-indigo-600';
    }
  }

  getTypeClasses(type: ToastType) {
    switch (type) {
      case 'success': return 'border-emerald-100 text-emerald-900 bg-emerald-50/50';
      case 'error': return 'border-red-100 text-red-900 bg-red-50/50';
      case 'warning': return 'border-amber-100 text-amber-900 bg-amber-50/50';
      default: return 'border-indigo-100 text-indigo-900 bg-indigo-50/50';
    }
  }
}
