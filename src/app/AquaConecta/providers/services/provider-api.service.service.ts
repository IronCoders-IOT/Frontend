import { Injectable } from '@angular/core';
import {BaseService} from '../../../shared/services/base.service';
import {HttpClient} from '@angular/common/http';
import {Observable, Subscription} from 'rxjs';
import {Provider} from '../model/provider.entity';
import {Resident} from '../model/resident.entity';
import {environment} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProviderApiServiceService extends BaseService<Provider> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = `providers`;
  }

  getAllProviders(): Observable<Provider[]> {
    return this.getAll();
  }

  getProviderById(id: number): Observable<Provider> {
    const url = `https://my-json-server.typicode.com/IronCoders-IOT/fake-api-server/providers/${id}`;
    return this.http.get<Provider>(url);
  }
}
