import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const dialog = inject(MatDialog);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 || error.status === 403) {
        const ref = dialog.open(SessionExpiredDialog);
        ref.afterClosed().subscribe(() => {
          auth.logout();
          router.navigate(['/agendaclientes/login']);
        });
        return throwError(() => error);
      }

      const message = error.error?.message || error.message || 'Error inesperado';
      snackBar.open(`❌ ${message}`, 'Cerrar', { duration: 5000 });
      return throwError(() => error);
    })
  );
};

import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-session-expired-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <div class="overlay">
      <div class="dialog">
        <h2>Sesión expirada</h2>
        <p>Tu sesión ha expirado. Vuelve a iniciar sesión para continuar.</p>
        <button mat-raised-button color="primary" [mat-dialog-close]="true">Aceptar</button>
      </div>
    </div>
    <style>
      .overlay {
        position: fixed; inset: 0; z-index: 1000;
        background: rgba(0,0,0,0.5);
        display: flex; align-items: center; justify-content: center;
      }
      .dialog {
        background: white; border-radius: 12px;
        padding: 2rem; max-width: 380px; width: 90%;
        text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }
      .dialog h2 { margin: 0 0 0.5rem; font-size: 1.25rem; }
      .dialog p { color: #666; margin: 0 0 1.5rem; }
      .dialog button { width: 100%; }
    </style>
  `,
})
class SessionExpiredDialog {}
