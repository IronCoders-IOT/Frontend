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

  getProviderProfile(): Observable<any> {
    return this.http.get<any>(`${this.basePath}profiles/me`, this.httpOptions);
  }

  getAllRequests(): Observable<WaterRequestEntity[]> {
    return this.getAll();
  }
    // se obtiene el los residentes con el providerId http://localhost:8080/api/v1/residents/by-provider/providerId, este te da el id del resident(id

    // con la id del residente obtenido te devuelve todos los residentes con water request http://localhost:8080/api/v1/water-request/resident/residentId
  getResidentProfileByResidentId(residentId: number): Observable<any> {
    const url = `${this.basePath}residents/{id}?userId=${residentId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  updateDeliveredAt(id: number, status:String,deliveredAt: Date): Observable<WaterRequestEntity> {
    const url = `${this.resourcePath()}/${id}`;
    const body = { status: status, deliveredAt: deliveredAt };
    return this.http.put<WaterRequestEntity>(url, body, this.httpOptions);
  }

}
