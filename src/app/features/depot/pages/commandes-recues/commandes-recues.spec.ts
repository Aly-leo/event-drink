import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandesRecues } from './commandes-recues';

describe('CommandesRecues', () => {
  let component: CommandesRecues;
  let fixture: ComponentFixture<CommandesRecues>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandesRecues],
    }).compileComponents();

    fixture = TestBed.createComponent(CommandesRecues);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
