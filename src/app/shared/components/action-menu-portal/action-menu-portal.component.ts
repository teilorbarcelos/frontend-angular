import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { ActionMenuService } from '../../../core/services/action-menu.service';

@Component({
  selector: 'app-action-menu-portal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (state(); as menu) {
      <div
        class="action-menu-portal"
        [style.position]="'fixed'"
        [style.z-index]="9999"
        [style.top.px]="menu.position.upwards ? undefined : menu.position.top + 4"
        [style.bottom.px]="
          menu.position.upwards ? viewportHeight - menu.position.top + 4 : undefined
        "
        [style.left.px]="menu.position.left"
        [style.width.px]="menu.position.width"
      >
        <div class="bg-white border border-gray-200 rounded-lg shadow-2xl py-1 overflow-hidden">
          <ng-container
            [ngTemplateOutlet]="menu.template"
            [ngTemplateOutletContext]="menu.context"
          ></ng-container>
        </div>
      </div>

      <div
        class="fixed inset-0 z-9998 bg-transparent"
        (click)="close()"
        (keydown.enter)="close()"
        (contextmenu)="$event.preventDefault(); close()"
        tabindex="-1"
        aria-hidden="true"
      ></div>
    }
  `,
})
export class ActionMenuPortalComponent {
  private service = inject(ActionMenuService);
  state = this.service.state;

  get viewportHeight() {
    return window.innerHeight;
  }

  close() {
    this.service.close();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll() {
    this.close();
  }
}
