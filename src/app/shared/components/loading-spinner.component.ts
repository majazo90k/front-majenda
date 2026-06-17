import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule, NgIf],
  template: `
    <div class="loading-overlay" *ngIf="loading">
      <mat-spinner [diameter]="diameter"></mat-spinner>
      <p class="loading-text" *ngIf="text">{{ text }}</p>
    </div>
  `,
  styles: [`
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
    }
    .loading-text {
      margin-top: 1rem;
      color: #6b7280;
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input({ required: true }) loading = false;
  @Input() diameter = 48;
  @Input() text = '';
}
