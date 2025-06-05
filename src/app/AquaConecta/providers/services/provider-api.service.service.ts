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

  CreateProvider(
    email: string,
    direction: string,
    documentNumber: string,
    documentType: string,
    phone: string,
    companyName: string,
    ruc: string,
    firstName: string,
    lastName: string
  ): Observable<Provider> {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.error('No auth token found in localStorage');
      return throwError(() => new Error('Token de autenticación no encontrado'));
    }

    const payload = {
      taxname: companyName,
      ruc: ruc,
      firstName: firstName,
      lastName: lastName,
      email: email,
      direction: direction || '',
      documentNumber: documentNumber,
      documentType: documentType,
      phone: phone
    };

    console.log('Enviando solicitud para crear proveedor con token');
    console.log('Token:', token);
    console.log('Payload:', payload);

    return this.http.post<Provider>(
      `${this.basePath}${this.resourceEndpoint}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    ).pipe(
      tap(() => {
        console.log('Proveedor creado exitosamente');
      }),
      catchError((error) => {
        console.error('Error al crear proveedor:', error);
        return throwError(() => new Error(`Error al crear proveedor: ${error.message || 'Error desconocido'}`));
      })
    );
  }
  getAllProviders(): Observable<Provider[]> {
    return this.getAll();
  }

  getProviderById(id: number): Observable<Provider> {
    console.log('Getting provider with ID:', id);
    return this.http.get<Provider>(`${this.basePath}${this.resourceEndpoint}/${id}/detail`, this.httpOptions);
  }
}
