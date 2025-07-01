import { Injectable } from '@angular/core';
import {BaseService} from '../../../shared/services/base.service';
import {HttpClient} from '@angular/common/http';
import {Resident} from '../model/resident.entity';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResidentApiServiceService extends BaseService<Resident>{

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = `${environment.serverBasePath}residents`;
  }

  //Selecciona los residentes de un proveedor, y todos los residentes tienen una suscripcion
  getAllResidentByProviderId(providerId: number): Observable<Resident[]> {
    const url = `${this.resourceEndpoint}/by-provider/${providerId}`;
    return this.http.get<Resident[]>(url, this.httpOptions);
  }
}
