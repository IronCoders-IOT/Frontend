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
    this.resourceEndpoint = 'water-supply-requests';
  }

  getProviderProfile(): Observable<any> {
    return this.http.get<any>(`${this.basePath}providers/me`, this.httpOptions);
  }

  getAllRequests(): Observable<WaterRequestEntity[]> {
    return this.http.get<WaterRequestEntity[]>(`${this.basePath}${this.resourceEndpoint}/admin`, this.httpOptions);
  }
  // se obtiene el los residentes con el providerId http://localhost:8080/api/v1/residents/by-provider/providerId, este te da el id del resident(id
  getResidentsByProviderId(providerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.basePath}residents`, this.httpOptions);
  }

  getResidentsByAdmin(): Observable<any[]> {
    return this.http.get<any[]>(`${this.basePath}residents/admin`, this.httpOptions);
  }

  getWaterRequestsByResidentId(residentId: number): Observable<WaterRequestEntity[]> {
    return this.http.get<WaterRequestEntity[]>(`${this.basePath}residents/${residentId}/water-supply-requests`, this.httpOptions);
  }

  // con la id del residente obtenido te devuelve todos los residentes con water request http://localhost:8080/api/v1/water-request/resident/residentId
  getResidentProfileByResidentId(residentId: number): Observable<any> {
    const url = `${this.basePath}residents/{id}?userId=${residentId}`;
    return this.http.get<any>(url, this.httpOptions);
  }

  updateDeliveredAt(id: number, status:String, deliveredAt: Date): Observable<WaterRequestEntity> {
    const url = `${this.resourcePath()}/${id}`;
    // Convertir la fecha al formato ISO 8601
    const isoDate = deliveredAt.toISOString();

    const body = {
      status: status,
      deliveredAt: isoDate  // Ahora es una string en formato ISO
    };
    console.log('PUT URL:', url);
    console.log('PUT Body:', body);

    return this.http.put<WaterRequestEntity>(url, body, this.httpOptions);
  }

}
