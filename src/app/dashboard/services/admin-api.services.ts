import {BaseService} from '../../../shared/services/base.service';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminApiServices extends BaseService<any> {

  constructor(http: HttpClient) {
    super(http);
    this.resourceEndpoint = `dashboard`;
  }

  getAdminSummary(): Observable<any> {
    return this.http.get<any>(`${this.basePath}${this.resourceEndpoint}/summary`, this.httpOptions);
  }

  getAdminById(id: number): Observable<any> {
    return this.http.get<any>(`${this.basePath}${this.resourceEndpoint}/${id}/detail`, this.httpOptions);
  }

  updateAdmin(admin: Partial<any>): Observable<any> {
    return this.http.put<any>(`${this.basePath}${this.resourceEndpoint}/edit`, admin, this.httpOptions);
  }
}
