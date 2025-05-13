import { TestBed } from '@angular/core/testing';

import { ResidentApiServiceService } from './resident-api.service.service';

describe('ResidentApiServiceService', () => {
  let service: ResidentApiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResidentApiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
