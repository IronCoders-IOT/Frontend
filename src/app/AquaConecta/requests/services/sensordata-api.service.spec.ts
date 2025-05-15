import { TestBed } from '@angular/core/testing';

import { SensordataApiService } from './sensordata-api.service';

describe('SensordataApiService', () => {
  let service: SensordataApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SensordataApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
