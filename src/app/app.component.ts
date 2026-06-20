import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgIf, RouterOutlet, MatProgressSpinnerModule],
  template: `
    <div *ngIf="!ready()" class="loading-screen">
      <mat-spinner diameter="48"></mat-spinner>
      <p>Cargando...</p>
    </div>
    <router-outlet *ngIf="ready()" />
  `,
  styles: [`
    .loading-screen {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      min-height: 100vh; gap: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white; font-size: 1.1rem;
    }
  `],
})
export class AppComponent {
  private auth = inject(AuthService);
  ready = this.auth.ready;
}
