import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { DepotsService } from '../services/depots.service';

/** Bloque l'accès à l'espace dépôt tant que le dépôt n'a pas terminé sa configuration. */
export const depotHasProfileGuard: CanActivateFn = () => {
  const depotsService = inject(DepotsService);
  const router = inject(Router);

  return depotsService.getMyDepot().pipe(
    map((depot) => (depot ? true : router.createUrlTree(['/depot/onboarding']))),
    catchError(() => of(router.createUrlTree(['/depot/onboarding'])))
  );
};

/** Empêche de repasser par l'onboarding une fois le dépôt déjà configuré. */
export const depotNoProfileGuard: CanActivateFn = () => {
  const depotsService = inject(DepotsService);
  const router = inject(Router);

  return depotsService.getMyDepot().pipe(
    map((depot) => (depot ? router.createUrlTree(['/depot/dashboard']) : true)),
    catchError(() => of(true))
  );
};
