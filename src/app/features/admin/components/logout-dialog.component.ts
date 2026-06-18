import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-logout-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="logout-dialog">
      <h2>¿Cerrar sesión?</h2>
      <p>¿Estás seguro que quieres salir?</p>
      <div class="logout-actions">
        <button mat-stroked-button [mat-dialog-close]="false">No</button>
        <button mat-raised-button color="primary" [mat-dialog-close]="true">Sí, salir</button>
      </div>
    </div>
    <style>
      .logout-dialog { padding: 1.5rem; text-align: center; min-width: 280px; }
      .logout-dialog h2 { margin: 0 0 0.5rem; font-size: 1.25rem; }
      .logout-dialog p { color: #666; margin: 0 0 1.5rem; }
      .logout-actions { display: flex; gap: 0.75rem; justify-content: center; }
    </style>
  `,
})
export class LogoutDialogComponent {}
