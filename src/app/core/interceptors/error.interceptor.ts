import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error) => {
      const message = error.error?.message || error.message || 'Error inesperado';
      snackBar.open(`❌ ${message}`, 'Cerrar', { duration: 5000 });
      return throwError(() => error);
    })
  );
};
