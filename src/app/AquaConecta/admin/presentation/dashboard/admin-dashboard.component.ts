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
import { ProviderApiServiceService } from '../../../providers/services/provider-api.service.service';
import { ResidentApiServiceService } from '../../../providers/services/resident-api.service.service';
import { SensordataApiService } from '../../../requests/services/sensordata-api.service';
import { ReportdataApiService } from '../../../reports/services/reportdata-api.service';
import { Provider } from '../../../providers/model/provider.entity';
import { Resident } from '../../../providers/model/resident.entity';
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

    constructor(
        private providerService: ProviderApiServiceService,
        private residentService: ResidentApiServiceService,
        private requestService: SensordataApiService,
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

            // Calculate total sensors
            this.totalSensors = providers.reduce((sum, provider) => sum + provider.sensors_number, 0);

            // Calculate financial metrics
            this.calculateFinancialMetrics(providers);
        });

        // Load residents data - assuming we have a method to get all residents
        this.fetchAllResidents();

        // Load requests data
        this.requestService.getAllRequests().subscribe(requests => {
            this.totalRequests = requests.length;
            this.recentRequests = requests.slice(0, 5);
        });


    }

    fetchAllResidents(): void {
        // This is a simplified approach - in a real app, you'd need to handle pagination
        // or have an endpoint that returns the count
        let allResidents: Resident[] = [];

        // Here we're assuming we might need to fetch residents for each provider
        this.providerService.getAllProviders().subscribe(providers => {
            providers.forEach(provider => {
                this.residentService.getAllResidentByProviderId(provider.id).subscribe(residents => {
                    allResidents = [...allResidents, ...residents];
                    this.totalResidents = allResidents.length;
                });
            });
        });
    }

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
