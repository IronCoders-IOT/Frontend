// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HeaderContentComponent } from '../../../../public/components/header-content/header-content.component';

import { forkJoin, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';

import { ProviderApiServiceService } from '../../../providers/services/provider-api.service.service';
import { ResidentService } from '../../../residents/services/resident.service';
import { SensordataApiService } from '../../../requests/services/sensordata-api.service';
import { ReportdataApiService } from '../../../reports/services/reportdata-api.service';

import { Provider } from '../../../providers/model/provider.entity';
import { Resident } from '../../../residents/models/resident.model';
import { WaterRequestEntity } from '../../../requests/model/water-request.entity';
import { ReportRequestEntity } from '../../../reports/model/report-request.entity';


@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatDividerModule,
        MatProgressBarModule,
        HeaderContentComponent
    ]
})
export class AdminDashboardComponent implements OnInit {
    // Summary cards data
    totalProviders: number = 0;
    totalResidents: number = 0;
    totalSensors: number = 0;
    totalReports: number = 0;
    totalRequests: number = 0;

    // Financial metrics
    currentMonthRevenue: number = 0;
    totalRevenue: number = 0;

    // Status overview data
    waterQualityAverage: number = 85; // Percentage (0-100)
    sensorHealthAverage: number = 92; // Percentage (0-100)
    systemUptimeAverage: number = 99.7; // Percentage (0-100)

    // Recent activity data
    recentProviders: Provider[] = [];
    recentRequests: WaterRequestEntity[] = [];
    recentReports: ReportRequestEntity[] = [];

    // Table columns configuration
    providerColumns: string[] = ['id', 'name', 'date', 'status'];
    requestColumns: string[] = ['id', 'resident', 'date', 'status'];
    reportColumns: string[] = ['id', 'title', 'date', 'status'];

    residentNamesMap: Map<number, string> = new Map();

    constructor(
        private providerService: ProviderApiServiceService,
        private residentService: ResidentService,
        private requestService: SensordataApiService, //water requests service no sensordata
        private reportService: ReportdataApiService
    ) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        // Load providers data
        this.providerService.getAllProviders().subscribe(providers => {
            this.totalProviders = providers.length;
            this.recentProviders = providers.slice(0, 5);

            console.log(this.recentProviders);
            // Calculate total sensors
            this.totalSensors = providers.reduce((sum, provider) => sum + provider.sensors_number, 0);

            // Calculate financial metrics
            this.calculateFinancialMetrics(providers);
        });

        // Load residents data - assuming we have a method to get all residents
        //this.fetchAllResidents();

      // Load Water requests data
      this.requestService.getAllRequests().subscribe({
        next: (requests) => {
          this.totalRequests = requests.length;

          this.recentRequests = requests.slice(0, 5).map(request =>({
            ...request,
            status: request.status === 'IN_PROGRESS' ? 'In Progress' :
              request.status === 'CLOSED' ? 'Closed' :
                request.status === 'RECEIVED' ? 'Received' :
                  request.status,
          }));

          // Contar residentes únicos
          this.residentService.getAllResidents().subscribe({
            next: (residents) => {
              this.totalResidents = residents.length;

            }
          })

          console.log('Requests loaded:', requests);

          // Cargar nombres de residentes para los requests recientes
          this.loadResidentNamesForRecentRequests();
        },
        error: (error) => {
          console.error('Error loading requests:', error);
        }
      });

      // Load reports data

      this.reportService.getAllReports().subscribe(reports => {
        this.totalReports = reports.length;
        this.recentReports = reports.slice(0, 5);
      });


    }

  private loadResidentNamesForRecentRequests(): void {
    // Obtener IDs únicos de los requests recientes
    const recentResidentIds = [...new Set(this.recentRequests.map(req => req.residentId))];

    // Cargar datos de cada residente
    recentResidentIds.forEach(residentId => {
      this.residentService.getResidentById(residentId).subscribe({
        next: (residentArray) => {

          if (residentArray ) {
            const resident = residentArray;

            const fullName = `${resident.firstName || ''} ${resident.lastName || ''}`.trim();
            this.residentNamesMap.set(residentId, fullName || 'Sin nombre');
          } else {
            this.residentNamesMap.set(residentId, 'Residente no encontrado');
          }
        },
        error: (error) => {
          console.error(`Error loading resident ${residentId}:`, error);
          this.residentNamesMap.set(residentId, 'Error al cargar');
        }
      });
    });
  }
  getResidentName(residentId: number): string {
    return this.residentNamesMap.get(residentId) || 'Cargando...';
  }

  /*
    fetchAllResidents(): void {
        // This is a simplified approach - in a real app, you'd need to handle pagination
        // or have an endpoint that returns the count
        let allResidents: Resident[] = [];

        // Here we're assuming we might need to fetch residents for each provider
        this.providerService.getAllProviders().subscribe(providers => {
            providers.forEach(provider => {
                this.residentService.getResidentsByProvider(provider.id).subscribe(residents => {
                    allResidents = [...allResidents, ...residents];
                    this.totalResidents = allResidents.length;
                });
            });
        });
    }
    */

    calculateFinancialMetrics(providers: Provider[]): void {
        // Calculate total revenue
        // Each sensor costs 258 PEN for the first month, then 50 PEN per month
        const totalSensors = providers.reduce((sum, provider) => sum + provider.sensors_number, 0);

        // Assuming all sensors have been active for 3 months (just for example)
        const averageMonthsActive = 3;

        // First month: 258 PEN per sensor
        // Subsequent months: 50 PEN per sensor per month
        this.totalRevenue = totalSensors * 258 + totalSensors * 50 * (averageMonthsActive - 1);

        // Current month revenue (all sensors at 50 PEN, assuming past first month)
        this.currentMonthRevenue = totalSensors * 50;
    }

    getStatusClass(value: number): string {
        if (value >= 90) return 'status-excellent';
        if (value >= 70) return 'status-good';
        if (value >= 50) return 'status-average';
        return 'status-poor';
    }
}
