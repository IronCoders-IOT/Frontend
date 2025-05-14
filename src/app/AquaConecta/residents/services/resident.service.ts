import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError, timer } from 'rxjs';
import { catchError, tap, mergeMap, retryWhen } from 'rxjs/operators';
import { Resident } from '../models/resident.model';
import { BaseService } from '../../../shared/services/base.service';

@Injectable({
    providedIn: 'root'
})
export class ResidentService extends BaseService<Resident> {
  private readonly API_URL = 'https://my-json-server.typicode.com/IronCoders-IOT/fake-api-serverv1.1';

  constructor(http: HttpClient) {
    super(http);
    this.basePath = this.API_URL;
    this.resourceEndpoint = 'residents';
  }

  getAllResidents(): Observable<Resident[]> {
    return this.http.get<Resident[]>(`${this.basePath}/${this.resourceEndpoint}`)
      .pipe(
        this.retryWithDelay(2,1000),
        tap((residents: Resident[]) => console.log('fetched residents', residents.length)),
        catchError(this.handleError)
      );
  }

  getResidentById(id: number): Observable<Resident> {
    return this.http.get<Resident>(`${this.basePath}${this.resourceEndpoint}/${id}`)
      .pipe(
        this.retryWithDelay(2,1000),
        tap((resident: Resident) => console.log(`Resident with ID:`, resident.id)),
        catchError(this.handleError)
      );
  }

  createResident(resident: Resident): Observable<Resident> {
    return this.http.post<Resident>(`${this.basePath}/${this.resourceEndpoint}`, resident)
      .pipe(
        tap((newResident: Resident) => console.log(`Created resident:`, newResident.id)),
        catchError(this.handleError)
      );
  }

  updateResident(id: number, resident: Resident): Observable<Resident> {
    return this.http.put<Resident>(`${this.basePath}/${this.resourceEndpoint}/${id}`, resident)
      .pipe(
        tap((updatedResident: Resident) => console.log(`Resident updated with ID:`, updatedResident.id)),
        catchError(this.handleError)
      );
  }

  deleteResident(id: number): Observable<void> {
    return this.http.delete(`${this.basePath}/${this.resourceEndpoint}/${id}`)
      .pipe(
        tap(_ => console.log(`Resident deleted with ID:`, id)),
        catchError(this.handleError)
      );
  }

  private retryWithDelay(maxRetry: number, delayMs: number) : (source: Observable<any>) => Observable<any> {
    return (source: Observable<any>) => source.pipe(
      retryWhen(errors => errors.pipe(
        mergeMap((error, i) => {
          const retryAttempt = i + 1;
          if (retryAttempt <= maxRetry) {
            console.log(`Attempt ${retryAttempt}: retrying in ${delayMs}ms`);
            return timer(delayMs);
          }
          return throwError(() => error);
        })
      ))
    );
    }

    public handleError(error: any): Observable<never>{
        console.error(`Error en ResidentService:`, error)
        return throwError(() => ({
          message: 'Error in ResidentService',
          originalError: error
        }));
    }
}
