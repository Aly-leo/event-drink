import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'catalogue',
        loadComponent: () =>
          import('./catalogue-admin/catalogue-admin').then((m) => m.CatalogueAdmin),
      },
      {
        path: 'plaintes',
        loadComponent: () =>
          import('./plaintes-admin/plaintes-admin').then((m) => m.PlaintesAdmin),
      },
    ],
  },
];
