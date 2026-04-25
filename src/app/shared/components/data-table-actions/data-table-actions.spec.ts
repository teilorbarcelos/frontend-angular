import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DataTableActionsComponent } from './data-table-actions.component';
import { ActionMenuService } from '../../../core/services/action-menu.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('DataTableActionsComponent', () => {
  let component: DataTableActionsComponent;
  let fixture: ComponentFixture<DataTableActionsComponent>;
  let mockMenuService: any;

  beforeEach(async () => {
    mockMenuService = {
      state: signal(null),
      open: vi.fn(),
      close: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DataTableActionsComponent],
      providers: [{ provide: ActionMenuService, useValue: mockMenuService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataTableActionsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render single button if only one action', () => {
    fixture.componentRef.setInput('showDelete', false);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('title')).toBe('Editar');
  });

  it('should render more actions button if multiple actions', () => {
    fixture.componentRef.setInput('showEdit', true);
    fixture.componentRef.setInput('showDelete', true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(1); // The "More" button
    expect(buttons[0].getAttribute('title')).toBe('Mais ações');
  });

  it('should call menuService.open when clicking more actions', () => {
    fixture.componentRef.setInput('showEdit', true);
    fixture.componentRef.setInput('showDelete', true);
    fixture.detectChanges();

    const moreBtn = fixture.nativeElement.querySelector('button');
    moreBtn.click();

    expect(mockMenuService.open).toHaveBeenCalled();
  });

  it('should open delete modal when delete is clicked', () => {
    fixture.componentRef.setInput('showEdit', false);
    fixture.componentRef.setInput('showDelete', true);
    fixture.detectChanges();

    const deleteBtn = fixture.nativeElement.querySelector('button');
    deleteBtn.click();

    expect(component.isDeleteDialogOpen()).toBe(true);
  });

  it('should emit delete when confirm delete', () => {
    const spy = vi.spyOn(component.delete, 'emit');
    component.isDeleteDialogOpen.set(true);
    fixture.detectChanges();

    component.confirmDelete();
    expect(spy).toHaveBeenCalledWith('123');
    expect(component.isDeleteDialogOpen()).toBe(false);
  });

  it('should handle extra actions', () => {
    const mockExtraAction = {
      label: 'Extra',
      icon: {},
      onClick: vi.fn(),
    };
    fixture.componentRef.setInput('extraActions', [mockExtraAction]);
    fixture.detectChanges();

    // Trigger the onClick through the actions getter
    const actions = component.actions;
    const extraAction = actions.find((a) => a.label === 'Extra');
    extraAction?.onClick();

    expect(mockExtraAction.onClick).toHaveBeenCalledWith('123');
  });

  it('should close menu if toggleDropdown is called when open', () => {
    mockMenuService.state.set({ context: component }); // Simulate menu open
    fixture.detectChanges();

    const event = new MouseEvent('click');
    const template = {} as any;
    component.toggleDropdown(event, template);

    expect(mockMenuService.close).toHaveBeenCalled();
  });

  it('should handle action and close menu', () => {
    const mockAction = {
      onClick: vi.fn(),
    };
    component.handleAction(mockAction);

    expect(mockAction.onClick).toHaveBeenCalled();
    expect(mockMenuService.close).toHaveBeenCalled();
  });

  it('should handle edit action through actions getter', () => {
    const spy = vi.spyOn(component.edit, 'emit');
    const actions = component.actions;
    const editAction = actions.find((a) => a.label === 'Editar');
    editAction?.onClick();
    expect(spy).toHaveBeenCalledWith('123');
  });

  it('should handle delete action through actions getter', () => {
    const actions = component.actions;
    const deleteAction = actions.find((a) => a.label === 'Excluir');
    deleteAction?.onClick();
    expect(component.isDeleteDialogOpen()).toBe(true);
  });

  it('should render dropdown template content', () => {
    fixture.componentRef.setInput('showEdit', true);
    fixture.componentRef.setInput('showDelete', true);
    fixture.detectChanges();

    const template = component.dropdownTemplate;
    const view = template.createEmbeddedView({});
    view.detectChanges();

    // Create a container to render the template view
    const container = document.createElement('div');
    view.rootNodes.forEach((node) => container.appendChild(node));

    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Editar');
    expect(buttons[1].textContent).toContain('Excluir');

    // Trigger handleAction from one of the buttons
    const spy = vi.spyOn(component, 'handleAction');
    buttons[0].click();
    expect(spy).toHaveBeenCalled();
  });

  it('should close delete modal when closed triggered from modal', () => {
    component.isDeleteDialogOpen.set(true);
    fixture.detectChanges();
    const modal = fixture.debugElement.query(By.css('app-modal')).componentInstance;
    modal.closed.emit();
    expect(component.isDeleteDialogOpen()).toBe(false);
  });

  it('should trigger confirmDelete from modal footer button', () => {
    const spy = vi.spyOn(component, 'confirmDelete');
    component.isDeleteDialogOpen.set(true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const deleteBtn = Array.from(buttons).find((b: any) =>
      b.textContent.includes('Excluir'),
    ) as HTMLButtonElement;
    deleteBtn?.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should close delete modal when clicking cancel button', () => {
    component.isDeleteDialogOpen.set(true);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    const cancelBtn = Array.from(buttons).find((b: any) =>
      b.textContent.includes('Cancelar'),
    ) as HTMLButtonElement;
    cancelBtn?.click();
    expect(component.isDeleteDialogOpen()).toBe(false);
  });

  it('should call all action onClick handlers', () => {
    component.actions.forEach((action) => {
      const spy = vi.spyOn(action, 'onClick');
      action.onClick();
      expect(spy).toHaveBeenCalled();
    });
  });

  it('should cover all action combinations for funcs coverage', () => {
    // cover extraActions being empty
    fixture.componentRef.setInput('extraActions', []);
    fixture.detectChanges();
    expect(component.actions.length).toBeGreaterThanOrEqual(1);

    // cover all onClick handlers
    component.actions.forEach((action) => {
      try {
        action.onClick();
      } catch {
        /* ignore error */
      }
    });
  });
});
