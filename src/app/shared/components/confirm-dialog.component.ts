import { Component, Inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  variant?: 'danger' | 'primary' | 'warning';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [NgIf, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="p-6 text-center max-w-sm">
      <div *ngIf="data.icon" class="mb-4">
        <div class="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
          [class.bg-rose-100]="data.variant === 'danger'"
          [class.bg-indigo-100]="data.variant === 'primary' || !data.variant"
          [class.bg-amber-100]="data.variant === 'warning'">
          <mat-icon class="text-3xl w-9 h-9"
            [class.text-rose-500]="data.variant === 'danger'"
            [class.text-indigo-500]="data.variant === 'primary' || !data.variant"
            [class.text-amber-500]="data.variant === 'warning'">{{ data.icon }}</mat-icon>
        </div>
      </div>
      <h2 class="text-lg font-bold text-gray-900 mb-2">{{ data.title }}</h2>
      <p class="text-sm text-gray-500 mb-6">{{ data.message }}</p>
      <div class="flex gap-3 justify-center">
        <button mat-stroked-button (click)="dialogRef.close(false)" class="!px-5">
          {{ data.cancelText || 'Cancelar' }}
        </button>
        <button mat-raised-button (click)="dialogRef.close(true)" class="!px-5 !text-white"
          [class.!bg-rose-500]="data.variant === 'danger'"
          [class.!bg-indigo-500]="data.variant === 'primary' || !data.variant"
          [class.!bg-amber-500]="data.variant === 'warning'">
          {{ data.confirmText || 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmData,
  ) {}
}
