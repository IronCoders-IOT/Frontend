import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { BaseService } from '../../shared/services/base.service';
import { ResidentData, SubscriptionData, SensorEvent, ResidentSensorData } from '../model/device-data.model';

@Injectable({
  providedIn: 'root'
})
export class DeviceDataService extends BaseService<any> {

  constructor(http: HttpClient) {
    super(http);
  }

  getProvidersProfile(): Observable<any> {
    console.log('=== SERVICIO: getProvidersProfile() ===');
    console.log('URL:', `${this.basePath}providers/{providerId}/profiles`);
    return this.http.get<any>(`${this.basePath}providers/{providerId}/profiles`, this.httpOptions);
  }

  getResidentsByProvider(providerId: number): Observable<ResidentData[]> {
    console.log('=== SERVICIO: getResidentsByProvider() ===');
    console.log('Provider ID:', providerId);
    const url = `${this.basePath}residents`;
    console.log('URL:', url);
    return this.http.get<ResidentData[]>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getSubscriptionByResident(residentId: number): Observable<SubscriptionData[]> {
    const url = `${this.basePath}residents/${residentId}/subscriptions`;
    return this.http.get<SubscriptionData[]>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getSensorEvents(deviceId: number): Observable<SensorEvent[]> {
    const url = `${this.basePath}devices/${deviceId}/events`;
    return this.http.get<SensorEvent[]>(url, this.httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  getCompleteSensorData(): Observable<ResidentSensorData[]> {
    console.log('=== SERVICIO: getCompleteSensorData() iniciado ===');
    return this.getProvidersProfile().pipe(
      switchMap(profile => {
        console.log('Perfil del proveedor obtenido:', profile);
        const providerId = profile.id;
        console.log('Provider ID:', providerId);

        if (!providerId) {
          console.error('No se pudo obtener el ID del proveedor del perfil');
          throw new Error('No se pudo obtener el ID del proveedor del perfil');
        }

        console.log('Llamando a getCompleteSensorDataByProvider con providerId:', providerId);
        return this.getCompleteSensorDataByProvider(providerId);
      })
    );
  }

  getCompleteSensorDataByProvider(providerId: number): Observable<ResidentSensorData[]> {
    console.log('=== SERVICIO: getCompleteSensorDataByProvider() iniciado ===');
    console.log('Provider ID recibido:', providerId);

    return this.getResidentsByProvider(providerId).pipe(
      switchMap(residents => {
        console.log('Residentes obtenidos:', residents);
        if (!residents || residents.length === 0) {
          console.log('No hay residentes para este proveedor');
          return of([]);
        }

        const residentDataObservables = residents.map(resident =>
          this.getSubscriptionByResident(resident.id).pipe(
            switchMap(subscriptions => {
              if (subscriptions && subscriptions.length > 0) {
                // Obtener eventos de todos los sensores del residente
                const sensorEventObservables = subscriptions.map(subscription =>
                  this.getSensorEvents(subscription.deviceId).pipe(
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
