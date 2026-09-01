import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotAbonnementPaiement } from './depot-abonnement-paiement';

describe('DepotAbonnementPaiement', () => {
  let component: DepotAbonnementPaiement;
  let fixture: ComponentFixture<DepotAbonnementPaiement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotAbonnementPaiement],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotAbonnementPaiement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
