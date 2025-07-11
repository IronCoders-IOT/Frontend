import { TestBed } from '@angular/core/testing';
import { ReportdataApiService } from './reportdata-api.service';

describe('ReportdataApiService', () => {
  let service: ReportdataApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportdataApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
