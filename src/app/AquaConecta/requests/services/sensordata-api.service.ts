import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { Observable } from 'rxjs';
import {BaseService} from '../../../shared/services/base.service';
import {WaterRequestEntity} from '../model/water-request.entity';

@Injectable({
  providedIn: 'root'
})
export class SensordataApiService extends BaseService<WaterRequestEntity> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = 'water_requests';
  }

  getAllRequests(): Observable<WaterRequestEntity[]> {
    return this.getAll();
  }


}
