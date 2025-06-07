import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment";
import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { catchError, Observable, retry, throwError } from "rxjs";
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BaseService<T> {

  basePath: string = `${environment.serverBasePath}`;
  resourceEndpoint: string = '/resources';

  constructor(protected http: HttpClient) { }

  // Método mejorado para obtener headers con debugging
  private getHttpOptions(): { headers: HttpHeaders } {
    const token = localStorage.getItem('auth_token');

    console.log('=== BUILDING HTTP OPTIONS ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Token preview:', token ? token.substring(0, 30) + '...' : 'NO_TOKEN');

    const headers = new HttpHeaders({
      'Content-type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });

    console.log('Built headers:', {
      'Content-type': 'application/json',
      'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'NO_AUTH'
    });
    console.log('=== END BUILDING HTTP OPTIONS ===');

    return { headers };
  }

  // Getter que usa el método mejorado
  get httpOptions(): { headers: HttpHeaders } {
    return this.getHttpOptions();
  }

  // Método de debugging público
  debugHttpOptions(): void {
    console.log('=== DEBUG HTTP OPTIONS ===');
    console.log('Base path:', this.basePath);
    console.log('Resource endpoint:', this.resourceEndpoint);
    console.log('Full resource path:', this.resourcePath());

    const options = this.getHttpOptions();
    console.log('HTTP Options structure:', options);
    console.log('=== END DEBUG HTTP OPTIONS ===');
  }

  handleError(error: HttpErrorResponse) {
    console.log('=== HANDLING ERROR ===');
    console.log('Error status:', error.status);
    console.log('Error message:', error.message);
    console.log('Error body:', error.error);
    console.log('Full error:', error);

    // Error específico para problemas de autenticación
    if (error.status === 401) {
      console.log('🚨 AUTHENTICATION ERROR DETECTED');
      console.log('Current token:', localStorage.getItem('auth_token'));
      return throwError(() => new Error('Authentication failed. Please log in again.'));
    }

    // Error específico para problemas de autorización
    if (error.status === 403) {
      console.log('🚨 AUTHORIZATION ERROR DETECTED');
      return throwError(() => new Error('You do not have permission to perform this action.'));
    }

    // Default error handling
    if (error.error instanceof ErrorEvent) {
      console.log(`An error occurred ${error.error.message}`);
    } else {
      // Unsuccessful Response Error Code returned from Backend
      console.log(`Backend returned code ${error.status}, body was ${error.error}`);
    }
    console.log('=== END HANDLING ERROR ===');

    return throwError(() => new Error('Something happened with request, please try again later'));
  }

  // Create Resource con debugging mejorado
  create(item: any): Observable<T> {
    console.log('=== BASE SERVICE CREATE ===');
    console.log('Item to create:', item);
    console.log('Resource path:', this.resourcePath());

    const options = this.getHttpOptions();
    console.log('Using options:', options);

    return this.http.post<T>(this.resourcePath(), JSON.stringify(item), options)
      .pipe(
        tap(response => {
          console.log('✅ BASE SERVICE CREATE SUCCESS:', response);
        }),
        retry(2),
        catchError((error) => {
          console.log('❌ BASE SERVICE CREATE ERROR:', error);
          return this.handleError(error);
        })
      );
  }

  // Delete Resource
  delete(id: any) {
    console.log('=== BASE SERVICE DELETE ===');
    console.log('Deleting ID:', id);

    return this.http.delete(`${this.resourcePath()}/${id}`, this.httpOptions)
      .pipe(
        tap(() => {
          console.log('✅ BASE SERVICE DELETE SUCCESS');
        }),
        retry(2),
        catchError((error) => {
          console.log('❌ BASE SERVICE DELETE ERROR:', error);
          return this.handleError(error);
        })
      );
  }

  // Update Resource
  update(id: any, item: any): Observable<T> {
    console.log('=== BASE SERVICE UPDATE ===');
    console.log('Updating ID:', id);
    console.log('Item data:', item);

    return this.http.put<T>(`${this.resourcePath()}/${id}`, JSON.stringify(item), this.httpOptions)
      .pipe(
        tap(response => {
          console.log('✅ BASE SERVICE UPDATE SUCCESS:', response);
        }),
        retry(2),
        catchError((error) => {
          console.log('❌ BASE SERVICE UPDATE ERROR:', error);
          return this.handleError(error);
        })
      );
  }

  // Get All Resources
  getAll(): Observable<T[]> {
    console.log('=== BASE SERVICE GET ALL ===');
    console.log('Resource path:', this.resourcePath());

    return this.http.get<T[]>(this.resourcePath(), this.httpOptions)
      .pipe(
        tap(response => {
          console.log('✅ BASE SERVICE GET ALL SUCCESS:', response);
        }),
        retry(2),
        catchError((error) => {
          console.log('❌ BASE SERVICE GET ALL ERROR:', error);
          return this.handleError(error);
        })
      );
  }

  protected resourcePath(): string {
    return `${this.basePath}${this.resourceEndpoint}`;
  }
}
