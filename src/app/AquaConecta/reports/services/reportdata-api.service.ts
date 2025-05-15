import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ReportRequestEntity } from '../model/report-request.entity';

@Injectable({
  providedIn: 'root'
})
export class ReportdataApiService {
  // Mock data for reports
  private mockReports: ReportRequestEntity[] = [
    {
      id: 1,
      resident_name: "Maria Rodriguez",
      emission_date: "2025-05-01",
      title: "Water leakage in main pipe",
      status: "Received"
    },
    {
      id: 2,
      resident_name: "Juan Perez",
      emission_date: "2025-04-28",
      title: "Contaminated water",
      status: "In Progress"
    },
    {
      id: 3,
      resident_name: "Ana Gomez",
      emission_date: "2025-04-20",
      title: "Low water pressure",
      status: "Closed"
    },
    {
      id: 4,
      resident_name: "Carlos Mendez",
      emission_date: "2025-05-05",
      title: "Billing issue",
      status: "Received"
    },
    {
      id: 5,
      resident_name: "Luis Torres",
      emission_date: "2025-04-15",
      title: "Water meter malfunction",
      status: "Closed"
    },
    {
      id: 6,
      resident_name: "Sofia Castro",
      emission_date: "2025-05-02",
      title: "Pipeline maintenance request",
      status: "In Progress"
    },
    {
      id: 7,
      resident_name: "Elena Vargas",
      emission_date: "2025-04-22",
      title: "Water quality inquiry",
      status: "Closed"
    },
    {
      id: 8,
      resident_name: "Andres Fuentes",
      emission_date: "2025-05-07",
      title: "Connection issue",
      status: "Received"
    }
  ];

  constructor(private http: HttpClient) {}

  getAllRequests(): Observable<ReportRequestEntity[]> {
    // Return static mock data instead of attempting to fetch from file
    return of(this.mockReports).pipe(
      catchError(error => {
        console.error('Error fetching reports:', error);
        return of([]);
      })
    );
  }
  getReportById(id: string): Observable<ReportRequestEntity> {
    // Simulación de backend, reemplaza luego con endpoint real
    return of({
      id: 1,
      title: 'LOW QUALITY SENSOR',
      resident_name: 'Juan Luis Guerra',
      resident_address: 'Amarillis 177, Ica',
      resident_phone: '968788999',
      technician_name: 'Juan Luis Guerra',
      visit_date: '2024-05-01',
      company: 'Enercom',
      technician_phone: '968788999',
      description: 'Low quality sensor detected in zone 5',
      status: 'Received',
      emission_date: new Date().toISOString()
    });
  }


}
