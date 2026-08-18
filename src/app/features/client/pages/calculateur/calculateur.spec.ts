import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Calculateur } from './calculateur';

describe('Calculateur', () => {
  let component: Calculateur;
  let fixture: ComponentFixture<Calculateur>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Calculateur],
    }).compileComponents();

    fixture = TestBed.createComponent(Calculateur);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
