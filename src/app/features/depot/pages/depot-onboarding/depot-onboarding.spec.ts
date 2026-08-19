import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotOnboarding } from './depot-onboarding';

describe('DepotOnboarding', () => {
  let component: DepotOnboarding;
  let fixture: ComponentFixture<DepotOnboarding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotOnboarding],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotOnboarding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
