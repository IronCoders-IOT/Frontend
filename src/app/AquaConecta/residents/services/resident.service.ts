import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Resident } from '../models/resident.model';
import { BaseService } from '../../../shared/services/base.service';
import { OperatorFunction, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ResidentService extends BaseService<Resident> {
    // Simular datos locales para desarrollo
    private residents: Resident[] = [];

    constructor(http: HttpClient) {
        super(http);
        this.resourceEndpoint = 'residents';
    }

    getAllResidents(): Observable<Resident[]> {
        return this.getAll();
    }

    getResidentById(id: number): Observable<Resident> {
        return this.http.get<Resident>(`${this.basePath}${this.resourceEndpoint}/${id}`, this.httpOptions)
            .pipe(
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
