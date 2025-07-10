import { TestBed } from '@angular/core/testing';

import { ProviderApiServiceService } from './provider-api.service.service';

describe('ProviderApiServiceService', () => {
  let service: ProviderApiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProviderApiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
