import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsCommandes } from './details-commandes';

describe('DetailsCommandes', () => {
  let component: DetailsCommandes;
  let fixture: ComponentFixture<DetailsCommandes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsCommandes],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsCommandes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
