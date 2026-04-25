import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  inject,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Edit2, Trash2, MoreHorizontal } from 'lucide-angular';
import { ModalComponent } from '../modal/modal.component';
import { ActionMenuService } from '../../../core/services/action-menu.service';

export interface ExtraAction {
  label: string;
  icon: unknown;
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
          (click)="toggleDropdown($event, dropdownTemplate)"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          [class.bg-gray-100]="isMenuOpen()"
          title="Mais ações"
        >
          <lucide-angular [img]="MoreIcon" class="w-4 h-4"></lucide-angular>
        </button>

        <ng-template #dropdownTemplate>
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
        </ng-template>
      }

      <!-- Modal de Confirmação -->
      <app-modal [isOpen]="isDeleteDialogOpen()" (closed)="isDeleteDialogOpen.set(false)">
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
  @ViewChild('dropdownTemplate') dropdownTemplate!: TemplateRef<unknown>;
  private menuService = inject(ActionMenuService);

  isDeleteDialogOpen = signal(false);
  readonly MoreIcon = MoreHorizontal;

  isMenuOpen() {
    return this.menuService.state()?.context === this;
  }

  get actions() {
    const list = [];

    if (this.showEdit) {
      list.push({
        label: 'Editar',
        icon: Edit2,
        onClick: () => this.edit.emit(this.id),
      });
    }

    if (this.showDelete) {
      list.push({
        label: 'Excluir',
        icon: Trash2,
        className: 'text-red-600 hover:bg-red-50',
        onClick: () => this.isDeleteDialogOpen.set(true),
      });
    }

    this.extraActions.forEach((action) => {
      list.push({
        label: action.label,
        icon: action.icon,
        className: action.className,
        onClick: () => action.onClick(this.id),
      });
    });

    return list;
  }

  @Input() id!: string;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() deleteMessage = 'Tem certeza que deseja excluir este registro?';
  @Input() extraActions: ExtraAction[] = [];

  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  toggleDropdown(event: MouseEvent, template: TemplateRef<unknown>) {
    event.stopPropagation();

    if (this.isMenuOpen()) {
      this.menuService.close();
    } else {
      this.menuService.open(template, this, event.currentTarget as HTMLElement);
    }
  }

  handleAction(action: { onClick: () => void }) {
    action.onClick();
    this.menuService.close();
  }

  confirmDelete() {
    this.delete.emit(this.id);
    this.isDeleteDialogOpen.set(false);
  }
}
