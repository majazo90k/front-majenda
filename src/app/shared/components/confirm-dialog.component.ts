import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="dialog">
      <h2>{{ data.title }}</h2>
      <p>{{ data.message }}</p>
      <div class="actions">
        <button mat-stroked-button [mat-dialog-close]="false">{{ data.cancelText || 'No' }}</button>
        <button mat-raised-button color="primary" [mat-dialog-close]="true">{{ data.confirmText || 'Sí' }}</button>
      </div>
    </div>
    <style>
      .dialog { padding: 1.5rem; text-align: center; min-width: 280px; }
      .dialog h2 { margin: 0 0 0.5rem; font-size: 1.25rem; }
      .dialog p { color: #666; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.75rem; justify-content: center; }
    </style>
  `,
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmData) {}
}
