import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotStocks } from './depot-stocks';

describe('DepotStocks', () => {
  let component: DepotStocks;
  let fixture: ComponentFixture<DepotStocks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotStocks],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotStocks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
