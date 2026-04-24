import { TestBed, ComponentFixture } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';
import { vi } from 'vitest';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show "Ativo" when active is true', () => {
    fixture.componentRef.setInput('active', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ativo');
  });

  it('should show "Inativo" when active is false', () => {
    fixture.componentRef.setInput('active', false);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Inativo');
  });

  it('should emit onClick when clicked', () => {
    const spy = vi.spyOn(component.onClick, 'emit');
    const el = fixture.nativeElement.querySelector('button');
    el?.click();
    expect(spy).toHaveBeenCalled();
  });
});
