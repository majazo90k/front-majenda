import { Routes } from '@angular/router';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/public-booking.component').then((m) => m.PublicBookingComponent),
  },
];
