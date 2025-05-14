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

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = 'residents';
  }

  getAllResidents(): Observable<Resident[]> {
    return this.getAll();
  }


}
