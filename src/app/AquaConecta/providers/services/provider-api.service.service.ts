import { Injectable } from '@angular/core';
import {BaseService} from '../../../shared/services/base.service';
import {WaterRequestEntity} from '../../requests/model/water-request.entity';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Provider} from '../model/provider.entity';

@Injectable({
  providedIn: 'root'
})
export class ProviderApiServiceService extends BaseService<Provider> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = 'providers';
  }

  getAllProviders(): Observable<Provider[]> {
    return this.getAll();
  }
}
