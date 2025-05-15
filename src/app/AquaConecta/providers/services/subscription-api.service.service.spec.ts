import { TestBed } from '@angular/core/testing';

import { SubscriptionApiServiceService } from './subscription-api.service.service';

describe('SubscriptionApiServiceService', () => {
  let service: SubscriptionApiServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubscriptionApiServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
