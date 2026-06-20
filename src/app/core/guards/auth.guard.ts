import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return new Promise<boolean | ReturnType<Router['parseUrl']>>((resolve) => {
    const check = () => {
      if (auth.isAuthenticated()) resolve(true);
      else resolve(router.parseUrl('/agendaclientes/login'));
    };
    if (auth.isAuthenticated()) return resolve(true);
    setTimeout(check, 100);
  });
};
