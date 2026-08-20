import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotCatalogues } from './depot-catalogues';

describe('DepotCatalogues', () => {
  let component: DepotCatalogues;
  let fixture: ComponentFixture<DepotCatalogues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotCatalogues],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotCatalogues);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
