import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';
import { Role } from './core/models/user.model';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'client',
    canActivate: [roleGuard(Role.CLIENT)],
    loadComponent: () =>
      import('./shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
  },
  {
    path: 'depot',
    canActivate: [roleGuard(Role.DEPOT)],
    loadComponent: () =>
      import('./shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
  },
  {
    path: 'admin',
    canActivate: [roleGuard(Role.ADMIN)],
    loadComponent: () =>
      import('./shared/components/coming-soon/coming-soon').then((m) => m.ComingSoon),
  },
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: '**', redirectTo: 'auth/login' },
];
