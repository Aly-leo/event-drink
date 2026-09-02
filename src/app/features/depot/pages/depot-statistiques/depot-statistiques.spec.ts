import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotStatistiques } from './depot-statistiques';

describe('DepotStatistiques', () => {
  let component: DepotStatistiques;
  let fixture: ComponentFixture<DepotStatistiques>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotStatistiques],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotStatistiques);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
