import { Injectable } from '@angular/core';
import { BaseService } from '../../../shared/services/base.service';
import { Event } from '../models/event.model';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, retry } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class EventService extends BaseService<Event> {
  
  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = 'event';

  }
  //https://my-json-server.typicode.com/IronCoders-IOT/fake-api-serverv1.1/
  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`https://my-json-server.typicode.com/IronCoders-IOT/fake-api-serverv1.1/${this.resourceEndpoint}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`https://my-json-server.typicode.com/IronCoders-IOT/fake-api-serverv1.1/${this.resourceEndpoint}/${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  getWaterQualityById(id: number): Observable<Event> {
    return this.http.get<Event>(`https://my-json-server.typicode.com/IronCoders-IOT/fake-api-serverv1.1/${this.resourceEndpoint}/water_quality/${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  getWaterLevelById(id: number): Observable<Event> {
    return this.http.get<Event>(`https://my-json-server.typicode.com/IronCoders-IOT/fake-api-serverv1.1/${this.resourceEndpoint}/water_level/${id}`, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      );
  }
  
}
