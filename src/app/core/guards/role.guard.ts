import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models';

export const roleGuard = (allowedRoles: UserRole[]) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.user();
  if (user && allowedRoles.includes(user.role)) {
    return true;
  }

  return router.parseUrl('/agendaclientes/login');
};
