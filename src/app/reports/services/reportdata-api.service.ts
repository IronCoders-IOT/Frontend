import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReportRequestEntity } from '../model/report-request.entity';
import {BaseService} from '../../shared/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class ReportdataApiService extends BaseService<ReportRequestEntity> {
  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = 'requests';
  }

  getAllProviders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.basePath}providers`, this.httpOptions);
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


  getReportById(id: string): Observable<ReportRequestEntity> {
   return this.http.get<any>(`${this.basePath}requests/${id}`, this.httpOptions);
  }

  getAllReports(): Observable<ReportRequestEntity[]> {
    return this.getAll();
  }


}
