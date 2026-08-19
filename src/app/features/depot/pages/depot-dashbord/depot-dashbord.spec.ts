import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotDashbord } from './depot-dashbord';

describe('DepotDashbord', () => {
  let component: DepotDashbord;
  let fixture: ComponentFixture<DepotDashbord>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotDashbord],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotDashbord);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
