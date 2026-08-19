import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotConsignes } from './depot-consignes';

describe('DepotConsignes', () => {
  let component: DepotConsignes;
  let fixture: ComponentFixture<DepotConsignes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotConsignes],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotConsignes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
