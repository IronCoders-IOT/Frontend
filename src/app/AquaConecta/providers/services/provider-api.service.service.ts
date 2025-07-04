import { Injectable } from '@angular/core';
import {BaseService} from '../../../shared/services/base.service';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, Subscription, tap, throwError} from 'rxjs';
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

  getProvidersProfile(): Observable<any> {
    const storedUser = localStorage.getItem('auth_user');
    if (!storedUser) {
      return throwError(() => new Error('No user found in localStorage'));
    }
    const user = JSON.parse(storedUser);
    console.log('Getting profile for user:', user);
    return this.http.get<any>(`${this.basePath}${this.resourceEndpoint}/me`, this.httpOptions);
  }

  UpdateProvider(provider: Partial<Provider>): Observable<any> {
    const storedUser = localStorage.getItem('auth_user');
    if (!storedUser) {
      return throwError(() => new Error('No user found in localStorage'));
    }
    const user = JSON.parse(storedUser);
    console.log('Updating provider for user:', user);
    return this.http.put<any>(`${this.basePath}${this.resourceEndpoint}/edit`, provider, this.httpOptions);
  }

  getAllProviders(): Observable<Provider[]> {
    return this.getAll();
  }

  getProviderById(id: number): Observable<Provider> {
    console.log('Getting provider with ID:', id);
    return this.http.get<Provider>(`${this.basePath}${this.resourceEndpoint}/${id}/detail`, this.httpOptions);
  }
}
