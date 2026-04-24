import { TestBed, ComponentFixture } from '@angular/core/testing';
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
      providers: [
        { provide: ActionMenuService, useValue: mockMenuService }
      ],
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

  it('should emit onDelete when confirm delete', () => {
    const spy = vi.spyOn(component.onDelete, 'emit');
    component.isDeleteDialogOpen.set(true);
    fixture.detectChanges();
    
    component.confirmDelete();
    expect(spy).toHaveBeenCalledWith('123');
    expect(component.isDeleteDialogOpen()).toBe(false);
  });
});
