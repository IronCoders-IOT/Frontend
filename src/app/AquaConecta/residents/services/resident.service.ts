import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError, timer } from 'rxjs';
import { catchError, tap, mergeMap, retryWhen } from 'rxjs/operators';
import { Resident } from '../models/resident.model';
import { BaseService } from '../../../shared/services/base.service';
import { OperatorFunction, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap } from 'rxjs/operators';
import { Event } from '../models/event.model';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class ResidentService extends BaseService<Resident> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = 'residents';
  }

    getAllResidents(): Observable<Resident[]> {
        return this.getAll();
    }

    getAllEventsByResidentId(residentId: number): Observable<Event[]> {
        return this.http.get<Resident[]>(`${this.basePath}${this.resourceEndpoint}`, this.httpOptions).pipe(
            map((residents: any[]) => {
            const allEvents: Event[] = [];
            const resident = residents.find((r: any) => r.id === residentId);

            if (resident && Array.isArray(resident.sensor_events)) {
                resident.sensor_events.forEach((event: any, index: number) => {
                allEvents.push({
                    id: index + 1,
                    event_type: event.event,
                    quality_value: event.water_quality,
                    status: event.status,
                    level_value: event.water_level
                });
                });
            }

            return allEvents;
            }),
            catchError(this.handleError)
        );
    }
  getAllResidents(): Observable<Resident[]> {
    return this.getAll();
  }

    getResidentById(id: number): Observable<Resident> {
        return this.http.get<any>(`${this.basePath}${this.resourceEndpoint}/${id}`, this.httpOptions)
            .pipe(
            map(data => new Resident({
                id: data.id,
                firstName: data.first_name,
                lastName: data.last_name,
                documentType: data.document_type,
                documentNumber: data.document_number,
                email: data.email,
                sensor_events: data.sensor_events,
                phone: data.phone,
                address: data.address
            })),
            retry(2),
            catchError(this.handleError)
        );
    }

    createResident(resident: Resident): Observable<Resident> {
        return this.create(resident);
    }

    updateResident(id: number, resident: Resident): Observable<Resident> {
        return this.update(id, resident);
    }

    deleteResident(id: number): Observable<any> {
        return this.delete(id);
    }

    // Para desarrollo local sin backend
    simulateCreateResident(resident: Resident): Observable<Resident> {
        // Simular ID generado
        const newResident = new Resident({
            ...resident,
            id: this.generateId()
        });

        this.residents.push(newResident);

        return of(newResident).pipe(
            tap(_ => console.log(`Created resident w/ id=${newResident.id}`))
        );
    }

    private generateId(): number {
        return this.residents.length > 0
            ? Math.max(...this.residents.map(resident => resident.id || 0)) + 1
            : 1;
    }
}
function retry<T>(count: number): OperatorFunction<T, T> {
    return retryWhen(errors =>
        errors.pipe(
            mergeMap((error, i) => {
                if (i < count - 1) {
                    // Retry after 1 second
                    return timer(1000);
                }
                return throwError(() => error);
            })
        )
    );
}
