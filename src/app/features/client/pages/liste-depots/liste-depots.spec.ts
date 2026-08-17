import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListeDepots } from './liste-depots';

describe('ListeDepots', () => {
  let component: ListeDepots;
  let fixture: ComponentFixture<ListeDepots>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListeDepots],
    }).compileComponents();

    fixture = TestBed.createComponent(ListeDepots);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
