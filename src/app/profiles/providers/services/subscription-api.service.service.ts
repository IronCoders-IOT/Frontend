import { Injectable } from '@angular/core';
import {BaseService} from '../../shared/services/base.service';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Subscription} from '../model/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionApiServiceService extends BaseService<Subscription> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = `subscriptions`;
  }

  getAllSubscriptions() {
    return this.getAll();
  }
  //
  getSubscriptionsByResidentId(residentId: number): Observable<Subscription[]> {
    const url = `/residents/${residentId}/${this.resourceEndpoint}`;
    return this.http.get<Subscription[]>(url, this.httpOptions);
  }

}
