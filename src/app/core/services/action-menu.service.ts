import { Injectable, signal, TemplateRef } from '@angular/core';

export interface ActionMenuState {
  template: TemplateRef<any>;
  context: any;
  position: { top: number; left: number; width: number; upwards: boolean };
}

@Injectable({
  providedIn: 'root'
})
export class ActionMenuService {
  state = signal<ActionMenuState | null>(null);

  open(template: TemplateRef<any>, context: any, trigger: HTMLElement) {
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const upwards = spaceBelow < 200;

    this.state.set({
      template,
      context,
      position: {
        top: upwards ? rect.top : rect.bottom,
        left: rect.right - 192, // 192px is w-48
        width: 192,
        upwards
      }
    });
  }

  close() {
    this.state.set(null);
  }
}
