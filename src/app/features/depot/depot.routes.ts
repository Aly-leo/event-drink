import { Routes } from '@angular/router';
import { depotHasProfileGuard, depotNoProfileGuard } from '../../core/guards/depot-profile.guard';

export const DEPOT_ROUTES: Routes = [
  {
    path: 'onboarding',
    canActivate: [depotNoProfileGuard],
    loadComponent: () => import('./pages/depot-onboarding/depot-onboarding').then((m) => m.DepotOnboarding),
  },
  {
    path: '',
    canActivate: [depotHasProfileGuard],
    loadComponent: () => import('./layout/depot-layout/depot-layout').then((m) => m.DepotLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', loadComponent: () => import('./pages/depot-dashbord/depot-dashbord').then((m) => m.DepotDashbord) },
      { path: 'catalogues', loadComponent: () => import('./pages/depot-catalogues/depot-catalogues').then((m) => m.DepotCatalogues) },
      { path: 'commandes', loadComponent: () => import('./pages/commandes-recues/commandes-recues').then((m) => m.CommandesRecues) },
      { path: 'commandes/:id', loadComponent: () => import('./pages/details-commandes/details-commandes').then((m) => m.DetailsCommandes) },
      { path: 'consignes', loadComponent: () => import('./pages/depot-consignes/depot-consignes').then((m) => m.DepotConsignes) },
      {
        path: 'abonnement/paiement/:palier',
        loadComponent: () => import('./pages/depot-abonnement-paiement/depot-abonnement-paiement').then((m) => m.DepotAbonnementPaiement),
      },
      {
        path: 'stocks',
        loadComponent: () => import('./pages/depot-stocks/depot-stocks').then((m) => m.DepotStocks),
      },
      { path: 'abonnement', loadComponent: () => import('./pages/abonnement/abonnement').then((m) => m.Abonnement) },
      { path: 'setting', loadComponent: () => import('./pages/depot-setting/depot-setting').then((m) => m.DepotSetting) },
      { path: 'compte', loadComponent: () => import('./pages/compte/compte').then((m) => m.Compte) },
    ],
  },

];