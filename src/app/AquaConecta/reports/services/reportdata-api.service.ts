import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { Observable } from 'rxjs';
import {BaseService} from '../../../shared/services/base.service';
import {ReportRequestEntity} from '../model/report-request.entity';

@Injectable({
  providedIn: 'root'
})
export class ReportdataApiService extends BaseService<ReportRequestEntity> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = 'Report_requests';
  }

  getAllRequests(): Observable<ReportRequestEntity[]> {
    return this.getAll();
  }


}
