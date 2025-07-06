// src/app/AquaConecta/subscriptions/services/subscription.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { SubscriptionModel } from '../models/subscription.model';
import { BaseService } from '../../../shared/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends BaseService<SubscriptionModel> {
  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = 'subscriptions';
  }

  getSubscriptionsByResidentId(residentId: number): Observable<SubscriptionModel[]> {
    const url = `${this.basePath}residents/${residentId}/subscriptions`;
    return this.http.get<SubscriptionModel[]>(url, this.httpOptions);
  }

  getAllSubscriptions(): Observable<SubscriptionModel[]> {
    return this.http.get<SubscriptionModel[]>(`${this.basePath}${this.resourceEndpoint}`, this.httpOptions);
  }

  getSubscriptionById(id: number): Observable<SubscriptionModel> {
    return this.http.get<SubscriptionModel>(`${this.basePath}${this.resourceEndpoint}/${id}`, this.httpOptions);
  }
}
