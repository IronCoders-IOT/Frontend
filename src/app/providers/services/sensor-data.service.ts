import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { BaseService } from '../../shared/services/base.service';
import { ResidentData, SubscriptionData, SensorEvent, ResidentSensorData } from '../model/sensor-data.model';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService extends BaseService<any> {

  constructor(http: HttpClient) {
    super(http);
  }

  getProvidersProfile(): Observable<any> {
    return this.http.get<any>(`${this.basePath}providers/me`, this.httpOptions);
  }

  getResidentsByProvider(providerId: number): Observable<ResidentData[]> {
    const url = `${this.basePath}residents/by-provider/${providerId}`;
    return this.http.get<ResidentData[]>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getSubscriptionByResident(residentId: number): Observable<SubscriptionData[]> {
    const url = `${this.basePath}subscriptions/resident/${residentId}`;
    return this.http.get<SubscriptionData[]>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getSensorEvents(sensorId: number): Observable<SensorEvent[]> {
    const url = `${this.basePath}events/sensor/${sensorId}`;
    return this.http.get<SensorEvent[]>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getCompleteSensorData(): Observable<ResidentSensorData[]> {
    return this.getProvidersProfile().pipe(
      switchMap(profile => {
        const providerId = profile.id;

        if (!providerId) {
          throw new Error('No se pudo obtener el ID del proveedor del perfil');
        }

        return this.getCompleteSensorDataByProvider(providerId);
      })
    );
  }

  getCompleteSensorDataByProvider(providerId: number): Observable<ResidentSensorData[]> {
    return this.getResidentsByProvider(providerId).pipe(
      switchMap(residents => {
        if (!residents || residents.length === 0) {
          return of([]);
        }

        const residentDataObservables = residents.map(resident =>
          this.getSubscriptionByResident(resident.id).pipe(
            switchMap(subscriptions => {
              if (subscriptions && subscriptions.length > 0) {
                // Obtener eventos de todos los sensores del residente
                const sensorEventObservables = subscriptions.map(subscription => 
                  this.getSensorEvents(subscription.sensorId).pipe(
                    catchError(() => of([]))
                  )
                );

                return forkJoin(sensorEventObservables).pipe(
                  map(allSensorEvents => {
                    // Combinar todos los eventos de todos los sensores
                    const combinedEvents = allSensorEvents.flat();
                    
                    return {
                      resident,
                      subscriptions: subscriptions,
                      sensorEvents: combinedEvents
                    } as ResidentSensorData;
                  }),
                  catchError(() => of({
                    resident,
                    subscriptions: subscriptions,
                    sensorEvents: []
                  } as ResidentSensorData))
                );
              } else {
                return of({
                  resident,
                  subscriptions: [],
                  sensorEvents: []
                } as ResidentSensorData);
              }
            }),
            catchError(() => of({
              resident,
              subscriptions: [],
              sensorEvents: []
            } as ResidentSensorData))
          )
        );

        return forkJoin(residentDataObservables);
      })
    );
  }
}
