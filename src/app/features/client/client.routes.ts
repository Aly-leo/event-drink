import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./client-layout/client-layout').then((m) => m.ClientLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'explorer' },
      {
        path: 'explorer',
        loadComponent: () => import('./depots-explorer/depots-explorer').then((m) => m.DepotsExplorer),
      },
      {
        path: 'depots/:id',
        loadComponent: () => import('./depot-detail/depot-detail').then((m) => m.DepotDetail),
      },
      {
        path: 'panier',
        loadComponent: () => import('./cart/cart').then((m) => m.Cart),
      },
      {
        path: 'checkout',
        loadComponent: () => import('./checkout/checkout').then((m) => m.Checkout),
      },
      {
        path: 'commandes',
        loadComponent: () => import('./orders-list/orders-list').then((m) => m.OrdersList),
      },
      {
        path: 'commandes/:id/confirmee',
        loadComponent: () =>
          import('./order-confirmed/order-confirmed').then((m) => m.OrderConfirmed),
      },
      {
        path: 'commandes/:id',
        loadComponent: () => import('./order-detail/order-detail').then((m) => m.OrderDetail),
      },
      {
        path: 'compte',
        loadComponent: () => import('./account/account').then((m) => m.Account),
      },
    ],
  },
];
