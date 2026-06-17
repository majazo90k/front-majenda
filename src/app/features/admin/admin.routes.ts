import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./admin.component').then((m) => m.AdminComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/components/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'agenda',
        loadComponent: () =>
          import('./gestion-agenda/components/agenda.component').then((m) => m.AgendaComponent),
      },
      {
        path: 'servicios',
        loadComponent: () =>
          import('./servicios/components/servicios.component').then((m) => m.ServiciosComponent),
      },
      {
        path: 'personal',
        loadComponent: () =>
          import('./personal/components/personal.component').then((m) => m.PersonalComponent),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./configuracion/components/configuracion.component').then((m) => m.ConfiguracionComponent),
      },
    ],
  },
];
