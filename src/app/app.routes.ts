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
    loadChildren: () => import('./features/client/client.routes').then((m) => m.CLIENT_ROUTES),
  },
  {
    path: 'depot',
  canActivate: [roleGuard(Role.DEPOT)],
  loadChildren: () =>
    import('./features/depot/depot.routes').then((m) => m.DEPOT_ROUTES),
  },

  {
    path: 'admin',
    canActivate: [roleGuard(Role.ADMIN)],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: '**', redirectTo: 'auth/login' },
];
