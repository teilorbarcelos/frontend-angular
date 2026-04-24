import { Component, Input, Output, EventEmitter, signal, HostListener, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Edit2, Trash2, MoreHorizontal, X } from 'lucide-angular';
import { ModalComponent } from '../modal/modal.component';

export interface ExtraAction {
  label: string;
  icon: any;
  onClick: (id: string) => void;
  className?: string;
}

@Component({
  selector: 'app-data-table-actions',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ModalComponent],
  template: `
    <div class="flex justify-end relative">
      @if (actions.length === 1) {
        <button
          (click)="actions[0].onClick()"
          class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          [title]="actions[0].label"
        >
          <lucide-angular [img]="actions[0].icon" class="w-4 h-4"></lucide-angular>
        </button>
      } @else if (actions.length > 1) {
        <button
          (click)="toggleDropdown($event)"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          [class.bg-gray-100]="isOpen()"
          title="Mais ações"
        >
          <lucide-angular [img]="MoreIcon" class="w-4 h-4"></lucide-angular>
        </button>

        @if (isOpen()) {
          <div 
            class="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1 animate-in fade-in zoom-in duration-200"
          >
            @for (action of actions; track action.label) {
              <button
                (click)="handleAction(action)"
                class="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                [ngClass]="action.className || ''"
              >
                <lucide-angular [img]="action.icon" class="w-4 h-4 mr-3"></lucide-angular>
                {{ action.label }}
              </button>
            }
          </div>
        }
      }

      <!-- Modal de Confirmação -->
      <app-modal [isOpen]="isDeleteDialogOpen()" (onClose)="isDeleteDialogOpen.set(false)">
        <span title>Confirmar Exclusão</span>
        <p class="text-sm text-gray-600 leading-relaxed">
          {{ deleteMessage }}
        </p>
        <div footer class="flex items-center space-x-3">
          <button 
            (click)="isDeleteDialogOpen.set(false)"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            (click)="confirmDelete()"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Excluir
          </button>
        </div>
      </app-modal>
    </div>
  `,
})
export class DataTableActionsComponent {
  private el = inject(ElementRef);

  @Input() id!: string;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() deleteMessage = 'Tem certeza que deseja excluir este registro?';
  @Input() extraActions: ExtraAction[] = [];

  @Output() onEdit = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  isOpen = signal(false);
  isDeleteDialogOpen = signal(false);
  readonly MoreIcon = MoreHorizontal;

  get actions() {
    const list = [];
    
    if (this.showEdit) {
      list.push({
        label: 'Editar',
        icon: Edit2,
        onClick: () => this.onEdit.emit(this.id)
      });
    }

    if (this.showDelete) {
      list.push({
        label: 'Excluir',
        icon: Trash2,
        className: 'text-red-600 hover:bg-red-50',
        onClick: () => this.isDeleteDialogOpen.set(true)
      });
    }

    this.extraActions.forEach(action => {
      list.push({
        label: action.label,
        icon: action.icon,
        className: action.className,
        onClick: () => action.onClick(this.id)
      });
    });

    return list;
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  handleAction(action: any) {
    action.onClick();
    this.isOpen.set(false);
  }

  confirmDelete() {
    this.onDelete.emit(this.id);
    this.isDeleteDialogOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
