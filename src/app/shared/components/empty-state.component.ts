import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [NgIf, MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon }}</mat-icon>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-message" *ngIf="message">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      text-align: center;
    }
    .empty-icon {
      font-size: 3rem;
      width: 3rem;
      height: 3rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }
    .empty-title {
      font-size: 1.125rem;
      font-weight: 500;
      color: #374151;
      margin: 0 0 0.5rem;
    }
    .empty-message {
      color: #6b7280;
      margin: 0;
    }
  `],
})
export class EmptyStateComponent {
  @Input({ required: true }) icon = 'info';
  @Input({ required: true }) title = '';
  @Input() message = '';
}
