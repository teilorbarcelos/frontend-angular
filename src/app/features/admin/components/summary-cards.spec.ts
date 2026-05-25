import { TestBed, ComponentFixture } from '@angular/core/testing';
import { SummaryCardsComponent } from './summary-cards.component';

describe('SummaryCardsComponent', () => {
  let fixture: ComponentFixture<SummaryCardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryCardsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryCardsComponent);
  });

  it('should render total counts correctly', () => {
    fixture.componentRef.setInput('totalUsers', 42);
    fixture.componentRef.setInput('totalProducts', 100);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('42');
    expect(compiled.textContent).toContain('100');
  });
});
