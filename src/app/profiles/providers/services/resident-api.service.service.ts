import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Resident} from '../model/resident.model';
import {Observable} from 'rxjs';
import {BaseService} from '../../../shared/services/base.service';
import {environment} from '../../../../environments/environment';

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
    const url = `${this.resourceEndpoint}`;
    return this.http.get<Resident[]>(url, this.httpOptions);
  }
}
