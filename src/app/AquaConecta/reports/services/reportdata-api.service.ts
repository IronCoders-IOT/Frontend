import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReportRequestEntity } from '../model/report-request.entity';
import {BaseService} from '../../../shared/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class ReportdataApiService extends BaseService<ReportRequestEntity> {
  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = 'requests';
  }

  getProviderProfile(): Observable<any> {
    return this.http.get<any>(`${this.basePath}providers/me`, this.httpOptions);
  }

  getReportsByProviderId(providerId: number): Observable<ReportRequestEntity[]> {

    return this.http.get<ReportRequestEntity[]>(`${this.basePath}requests/provider/${providerId}`, this.httpOptions)
  }

  getResidentById(residentId: number): Observable<any> {
    return this.http.get<any>(`${this.basePath}residents/{id}?userId=${residentId}`, this.httpOptions);
  }

  /*
  getReportById(id: string): Observable<ReportRequestEntity> {
    // Simulación de backend, reemplaza luego con endpoint real
    return of({
      id: 1,
      title: 'LOW QUALITY SENSOR',
      resident_name: 'Juan Luis Guerra',
      resident_address: 'Amarillis 177, Ica',
      resident_phone: '968788999',
      technician_name: 'Juan Luis Guerra',
      visit_date: '2024-05-01',
      company: 'Enercom',
      technician_phone: '968788999',
      description: 'Low quality sensor detected in zone 5',
      status: 'Received',
      emission_date: new Date().toISOString()
    });
  }
  */

}
