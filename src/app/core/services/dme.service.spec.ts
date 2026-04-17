import { TestBed } from '@angular/core/testing';

import { DmeService } from './dme.service';

describe('DmeService', () => {
  let service: DmeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DmeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
