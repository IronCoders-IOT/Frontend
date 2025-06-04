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
    this.resourceEndpoint = 'water-request';
  }

  getAllRequests(): Observable<WaterRequestEntity[]> {
    return this.getAll();
  }

  getResidentProfileByResidentId(residentId: number): Observable<any> {
    const url = `${this.basePath}residents/{id}?userId=${residentId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  updateDeliveredAt(id: number, status:String,deliveredAt: Date): Observable<WaterRequestEntity> {
    const url = `${this.resourcePath()}/${id}`;
    const body = { status: status, delivered_at: deliveredAt };
    return this.http.put<WaterRequestEntity>(url, body, this.httpOptions);
  }

}
