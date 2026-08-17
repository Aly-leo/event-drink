import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotInscription } from './depot-inscription';

describe('DepotInscription', () => {
  let component: DepotInscription;
  let fixture: ComponentFixture<DepotInscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotInscription],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotInscription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
