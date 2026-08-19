import { TestBed } from '@angular/core/testing';

import { Depot } from './depot';

describe('Depot', () => {
  let service: Depot;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Depot);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
