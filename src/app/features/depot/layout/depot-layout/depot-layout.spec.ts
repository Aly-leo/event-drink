import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotLayout } from './depot-layout';

describe('DepotLayout', () => {
  let component: DepotLayout;
  let fixture: ComponentFixture<DepotLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
