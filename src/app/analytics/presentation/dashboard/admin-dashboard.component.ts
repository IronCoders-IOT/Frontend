import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { HeaderContentComponent } from '../../../public/components/header-content/header-content.component';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle/language-toggle.component';

import { ProviderApiServiceService } from '../../../providers/services/provider-api.service.service';
import { ResidentService } from '../../../residents/services/resident.service';
import { ResidentApiServiceService } from '../../../providers/services/resident-api.service.service';
import { SensordataApiService } from '../../../water-requests/services/sensordata-api.service';
import { ReportdataApiService } from '../../../issue-reports/services/reportdata-api.service';
import { SensorDataService } from '../../../providers/services/sensor-data.service';
import { Provider } from '../../../providers/model/provider.model';
import { WaterRequestModel } from '../../../water-requests/model/water-request.model';
import { IssueReportModel } from '../../../issue-reports/model/issue-report.model';
import { SensorEvent } from '../../../providers/model/sensor-data.model';
import { AuthService } from '../../../iam/application/services/auth.service';
import { AdminApiServices } from '../services/admin-api.services';
import { LanguageService } from '../../../shared/services/language.service';
import { TranslationService } from '../../../shared/services/translation.service';



@Component({
    selector: 'app-admin-dashboard',
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTableModule,
        MatDividerModule,
        MatProgressBarModule,
        HeaderContentComponent,
        LanguageToggleComponent
    ]
})
export class AdminDashboardComponent implements OnInit {
    username: string | null = null;
    userRole: string | null = null;
    showProfileDropdown: boolean = false;
    selectedLanguage: string = 'en';

  // Summary cards data
    totalProviders: number = 0;
    totalResidents: number = 0;
    totalSensors: number = 0;
    totalReports: number = 0;
    totalRequests: number = 0;

    // Financial metrics
    currentMonthRevenue: number = 0;
    totalRevenue: number = 0;

    // Real sensor data metrics
    averageWaterQuality: number = 0;
    averageWaterLevel: number = 0;
    recentEventsCount: number = 0;
    criticalEventsCount: number = 0;

    // Legacy status overview data (keeping for compatibility)
    waterQualityAverage: number = 85; // Percentage (0-100)
    sensorHealthAverage: number = 92; // Percentage (0-100)
    systemUptimeAverage: number = 99.7; // Percentage (0-100)

    // Recent activity data
    recentProviders: Provider[] = [];
    recentRequests: WaterRequestModel[] = [];
    recentReports: IssueReportModel[] = [];


    // Table columns configuration
    providerColumns: string[] = ['id', 'name', 'date', 'status'];
    requestColumns: string[] = ['id', 'resident', 'date', 'status'];
    reportColumns: string[] = ['id', 'title', 'date', 'status'];

    residentNamesMap: Map<number, string> = new Map();

    constructor(
        private providerService: ProviderApiServiceService,
        private residentService: ResidentService,
        private residentApiService: ResidentApiServiceService,
        private requestService: SensordataApiService,
        private reportService: ReportdataApiService,
        private adminService: AdminApiServices,
        private authService: AuthService,
        private languageService: LanguageService,
        private translationService: TranslationService,
        private sensorDataService: SensorDataService
) { }

    ngOnInit(): void {
      this.loadUsername();
      this.loadDashboardData();
      this.loadSensorMetrics();

      // Load saved language
      const savedLanguage = localStorage.getItem('selected_language');
      if (savedLanguage) {
        this.selectedLanguage = savedLanguage;
      }

      // Subscribe to language changes
      this.languageService.currentLanguage$.subscribe(language => {
        this.selectedLanguage = language;
      });
    }
  private loadUsername(): void {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.username = user?.username || null;
        if(user?.username === "admin") {
          this.userRole = user?.role || 'Administrator';
        }else {
          this.userRole = user?.role || 'Provider';
        }
        console.log(this.userRole);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.username = null;
        this.userRole = 'Provider';
      }
    }
  }


  // Profile dropdown methods
    toggleProfileDropdown(): void {
      this.showProfileDropdown = !this.showProfileDropdown;
    }

    getUserInitials(): string {
      if (!this.username) return 'U';
      return this.username
        .split(' ')
        .map(name => name.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
    }

    logout(): void {
      this.showProfileDropdown = false;
      this.authService.logout();
    }

    loadDashboardData(): void {
      // Use the dashboard summary endpoint for all main counters
      this.adminService.getAdminSummary().subscribe({
        next: (summary) => {
          // Load all data from the summary endpoint
          this.totalProviders = summary.totalProviders || 0;
          this.totalResidents = summary.totalResidents || 0;
          this.totalSensors = summary.activeSubscriptions || 0; // Active subscriptions = active sensors
          this.currentMonthRevenue = summary.totalIncome || 0;
          this.totalRevenue = summary.monthlyIncome || 0;

          console.log('Dashboard summary loaded:', {
            totalProviders: this.totalProviders,
            totalResidents: this.totalResidents,
            totalSensors: this.totalSensors,
            currentMonthRevenue: this.currentMonthRevenue,
            totalRevenue: this.totalRevenue
          });
        },
        error: (error) => {
          console.error('Error loading dashboard summary:', error);
          // Set default values if the summary fails
          this.totalProviders = 0;
          this.totalResidents = 0;
          this.totalSensors = 0;
          this.currentMonthRevenue = 0;
          this.totalRevenue = 0;
        }
      });

      // Load recent activity data for tables
      this.loadRecentActivities();
    }

    private loadRecentActivities(): void {
      // Load recent providers for the table
      this.providerService.getAllProviders().subscribe({
        next: (providers) => {
          this.recentProviders = providers.slice(0, 5);
        },
        error: (error) => {
          console.error('Error loading recent providers:', error);
          this.recentProviders = [];
        }
      });

      // Load recent water-requests for the table
      this.requestService.getAllRequests().subscribe({
        next: (requests) => {
          this.totalRequests = requests.length;
          this.recentRequests = requests.slice(0, 5).map(request => ({
            ...request,
            status: request.status === 'IN_PROGRESS' ? 'In Progress' :
              request.status === 'CLOSED' ? 'Closed' :
                request.status === 'RECEIVED' ? 'Received' : request.status,
          }));
          this.loadResidentNamesForRecentRequests();
        },
        error: (error) => {
          console.error('Error loading water-requests:', error);
          this.totalRequests = 0;
          this.recentRequests = [];
        }
      });

      // Load recent issue-reports for the table
      this.reportService.getAllReports().subscribe({
        next: (reports) => {
          this.totalReports = reports.length;
          this.recentReports = reports.slice(0, 5).map(report => ({
            ...report,
            status: report.status === 'IN_PROGRESS' ? 'In Progress' :
              report.status === 'CLOSED' ? 'Closed' :
                report.status === 'RECEIVED' ? 'Received' : report.status,
          }));
        },
        error: (error) => {
          console.error('Error loading issue-reports:', error);
          this.totalReports = 0;
          this.recentReports = [];
        }
      });
    }

  private loadResidentNamesForRecentRequests(): void {
    // Obtener IDs únicos de los water-requests recientes
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

    getStatusClass(value: number): string {
        if (value >= 90) return 'status-excellent';
        if (value >= 70) return 'status-good';
        if (value >= 50) return 'status-average';
        return 'status-poor';
    }

    changeLanguage(event: any): void {
        this.selectedLanguage = event.target.value;
        this.languageService.changeLanguage(this.selectedLanguage);
      }

      translate(key: string): string {
        return this.translationService.translate(key);
      }

      translateStatus(status: string): string {
        const statusMap: { [key: string]: string } = {
          'Received': 'received',
          'In Progress': 'in_progress',
          'Closed': 'closed',
          'Active': 'active'
        };
        return this.translate(statusMap[status] || status.toLowerCase());
      }

      loadSensorMetrics(): void {
        this.providerService.getAllProviders().subscribe({
          next: (providers) => {
            if (providers.length === 0) {
              console.log('No providers found, cannot load sensor data');
              return;
            }

            const allSensorData: SensorEvent[] = [];
            let processedProviders = 0;
            let globalSensorId = 1;

            providers.forEach(provider => {
              this.residentApiService.getAllResidentByProviderId(provider.id).subscribe({
                next: (residents) => {
                  let processedResidents = 0;
                  const totalResidentsForProvider = residents.length;

                  if (residents.length === 0) {
                    processedProviders++;
                    if (processedProviders === providers.length) {
                      this.finalizeSensorDataProcessing(allSensorData);
                    }
                    return;
                  }

                  residents.forEach(resident => {
                    const sensorId = globalSensorId++;

                    this.sensorDataService.getSensorEvents(sensorId).subscribe({
                      next: (events) => {
                        allSensorData.push(...events);
                        processedResidents++;

                        if (processedResidents === totalResidentsForProvider) {
                          processedProviders++;
                          if (processedProviders === providers.length) {
                            this.finalizeSensorDataProcessing(allSensorData);
                          }
                        }
                      },
                      error: (error) => {
                        console.error(`Error loading sensor events for sensor ${sensorId}:`, error);
                        processedResidents++;

                        if (processedResidents === totalResidentsForProvider) {
                          processedProviders++;
                          if (processedProviders === providers.length) {
                            this.finalizeSensorDataProcessing(allSensorData);
                          }
                        }
                      }
                    });
                  });
                },
                error: (error) => {
                  console.error(`Error loading residents for provider ${provider.id}:`, error);
                  processedProviders++;

                  if (processedProviders === providers.length) {
                    this.finalizeSensorDataProcessing(allSensorData);
                  }
                }
              });
            });
          },
          error: (error) => {
            console.error('Error loading providers:', error);
          }
        });
      }

      private finalizeSensorDataProcessing(allSensorData: SensorEvent[]): void {
        if (allSensorData.length > 0) {
          this.processRealSensorEvents(allSensorData);
        } else {
          this.averageWaterQuality = 0;
          this.averageWaterLevel = 0;
          this.recentEventsCount = 0;
          this.criticalEventsCount = 0;
        }
      }

      private processRealSensorEvents(events: SensorEvent[]): void {
        if (events.length === 0) {
          this.averageWaterQuality = 0;
          this.averageWaterLevel = 0;
          this.recentEventsCount = 0;
          this.criticalEventsCount = 0;
          return;
        }

        // Nuevo mapeo de calidad del agua según los nuevos atributos
        const qualityTextToNumber: { [key: string]: number } = {
          'excelente': 95,
          'aceptable': 75,
          'no potable': 40,
          'no hay agua': 10,
          'error tds': 10,
          'agua contaminada': 10
        };

        // Calcular promedio de calidad del agua
        const qualityValues = events
          .filter(event => event.qualityValue && qualityTextToNumber.hasOwnProperty(event.qualityValue.toLowerCase()))
          .map(event => qualityTextToNumber[event.qualityValue.toLowerCase()]);

        this.averageWaterQuality = qualityValues.length > 0
          ? qualityValues.reduce((sum, val) => sum + val, 0) / qualityValues.length : 0;

        // Calcular promedio de nivel de agua
        const levelValues = events
          .filter(event => event.levelValue && !isNaN(parseFloat(event.levelValue)))
          .map(event => parseFloat(event.levelValue));

        this.averageWaterLevel = levelValues.length > 0
          ? levelValues.reduce((sum, val) => sum + val, 0) / levelValues.length : 0;

        // Contar eventos recientes y críticos
        this.recentEventsCount = events.length;
        this.criticalEventsCount = events.filter(event => {
          const quality = event.qualityValue ? event.qualityValue.toLowerCase() : '';
          const qualityIsCritical = [
            'no potable',
            'no hay agua',
            'error tds',
            'agua contaminada'
          ].includes(quality);
          const level = parseFloat(event.levelValue || '100');
          const levelIsCritical = level < 30;
          return qualityIsCritical || levelIsCritical;
        }).length;

        this.adjustRealMetricsBasedOnSystemActivity();
      }

      private adjustRealMetricsBasedOnSystemActivity(): void {
        // Apply minor adjustments based on system activity
        if (this.totalReports > 5) {
          const reportImpact = Math.min(5, (this.totalReports - 5) * 0.5);
          this.averageWaterQuality = Math.max(0, this.averageWaterQuality - reportImpact);
        }

        if (this.totalRequests > 10) {
          const requestImpact = Math.min(3, (this.totalRequests - 10) * 0.3);
          this.averageWaterLevel = Math.max(0, this.averageWaterLevel - requestImpact);
        }

        // Increase critical events slightly if there's high system activity
        const activityBasedCritical = Math.floor((this.totalReports + this.totalRequests) * 0.1);
        this.criticalEventsCount = Math.min(this.recentEventsCount, this.criticalEventsCount + activityBasedCritical);
      }

      getQualityStatusClass(value: number): string {
        if (value >= 80) return 'status-excellent';
        if (value >= 60) return 'status-good';
        if (value >= 40) return 'status-average';
        return 'status-poor';
      }

      getLevelStatusClass(value: number): string {
        if (value >= 70) return 'status-excellent';
        if (value >= 50) return 'status-good';
        if (value >= 30) return 'status-average';
        return 'status-poor';
      }
}
