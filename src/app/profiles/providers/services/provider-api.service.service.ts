import { Injectable } from '@angular/core';
import {BaseService} from '../../shared/services/base.service';
import {HttpClient} from '@angular/common/http';
import {catchError, Observable, Subscription, tap, throwError} from 'rxjs';
import {Provider} from '../model/provider.model';
import {Resident} from '../model/resident.model';

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
    return this.http.get<any>(`${this.basePath}${this.resourceEndpoint}/${user.id}/profiles`, this.httpOptions);
  }

  UpdateProvider(provider: Partial<Provider>): Observable<any> {
    const storedUser = localStorage.getItem('auth_user');
    if (!storedUser) {
      return throwError(() => new Error('No user found in localStorage'));
    }
    const user = JSON.parse(storedUser);
    console.log('Updating provider for user:', user);
    return this.http.put<any>(`${this.basePath}${this.resourceEndpoint}/{providerId}/profiles`, provider, this.httpOptions);
  }

  getAllProviders(): Observable<Provider[]> {
    return this.getAll();
  }

  getProviderById(id: number): Observable<Provider> {
    console.log('Getting provider with ID:', id);
    return this.http.get<Provider>(`${this.basePath}${this.resourceEndpoint}/${id}/profiles`, this.httpOptions);
  }

  // Método específico para admin - endpoint directo sin /profiles
  getProviderByIdForAdmin(id: number): Observable<Provider> {
    console.log('Getting provider with ID for admin:', id);
    return this.http.get<Provider>(`${this.basePath}${this.resourceEndpoint}/${id}`, this.httpOptions);
  }
}
