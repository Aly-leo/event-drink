import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepotSetting } from './depot-setting';

describe('DepotSetting', () => {
  let component: DepotSetting;
  let fixture: ComponentFixture<DepotSetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepotSetting],
    }).compileComponents();

    fixture = TestBed.createComponent(DepotSetting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
