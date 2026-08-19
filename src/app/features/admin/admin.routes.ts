import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./catalogue-admin/catalogue-admin').then((m) => m.CatalogueAdmin),
  },
];
