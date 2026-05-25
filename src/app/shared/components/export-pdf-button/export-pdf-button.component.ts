import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, FileText } from 'lucide-angular';
import { ButtonComponent } from '../button/button.component';
import { downloadPdf } from '../../../core/utils/download';
import { Observable, finalize } from 'rxjs';

@Component({
  selector: 'app-export-pdf-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
  template: `
    <app-button variant="secondary" [loading]="isExporting" (btnClick)="handleExport()">
      <lucide-angular [img]="FileTextIcon" class="w-4 h-4 mr-2"></lucide-angular>
      {{ label }}
    </app-button>
  `,
})
export class ExportPdfButtonComponent<T = unknown> {
  @Input({ required: true }) onExport!: (params: T) => Observable<Blob>;
  @Input({ required: true }) queryParams!: T;
  @Input() filename = 'relatorio.pdf';
  @Input() label = 'Exportar PDF';

  isExporting = false;
  readonly FileTextIcon = FileText;

  handleExport() {
    this.isExporting = true;
    this.onExport(this.queryParams)
      .pipe(finalize(() => (this.isExporting = false)))
      .subscribe({
        next: (blob) => {
          downloadPdf(blob, this.filename);
        },
        error: (error) => {
          console.error('Erro ao exportar PDF:', error);
        },
      });
  }
}
