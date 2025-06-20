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
import { HeaderContentComponent } from '../../../../public/components/header-content/header-content.component';
import { LanguageToggleComponent } from '../../../../shared/components/language-toggle/language-toggle.component';

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
import {AuthService} from '../../../auth/application/services/auth.service';
import {AdminApiServices} from '../services/admin-api.services';
import { LanguageService } from '../../../../shared/services/language.service';
import { TranslationService } from '../../../../shared/services/translation.service';



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

    residentNamesMap: Map<number, string> = new Map();    constructor(
        private providerService: ProviderApiServiceService,
        private residentService: ResidentService,
        private requestService: SensordataApiService, //water requests service no sensordata
        private reportService: ReportdataApiService,
        private adminService: AdminApiServices,
        private authService: AuthService,
        private languageService: LanguageService,
        private translationService: TranslationService

) { }

    ngOnInit(): void {
      this.loadUsername();
      this.loadDashboardData();
      
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

      // Cerrar dropdown
      this.showProfileDropdown = false;
      console.log('=== INICIO LOGOUT COMPONENT ===');

      // Verificar token ANTES del logout del servicio
      const tokenBefore = localStorage.getItem('auth_token');
      console.log('Token ANTES de llamar authService.logout():', tokenBefore ? 'Existe' : 'No existe');

      // Limpiar estado local PRIMERO
      console.log('Limpiando estado local del componente...');

      console.log('Estado local limpiado');

      // LLAMAR AL LOGOUT DEL SERVICIO
      console.log('Llamando a authService.logout()...');
      this.authService.logout();

      // Verificar token DESPUÉS del logout del servicio
      setTimeout(() => {
        const tokenAfter = localStorage.getItem('auth_token');
        console.log('Token DESPUÉS de authService.logout():', tokenAfter ? 'AÚN EXISTE!' : 'Eliminado');
        console.log('=== FIN LOGOUT COMPONENT ===');
      }, 100);    // Redirigir al login
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
        this.recentReports = reports.slice(0, 5).map(reports =>({
          ...reports,
          status: reports.status === 'IN_PROGRESS' ? 'In Progress' :
            reports.status === 'CLOSED' ? 'Closed' :
              reports.status === 'RECEIVED' ? 'Received' :
                reports.status,
        }));


      });

      // Load admin summary data

      this.adminService.getAdminSummary().subscribe({
        next: (summary) => {
          console.log(summary);
          this.totalProviders = summary.totalProveedores || 85; // Default to 85 if not provided
          this.totalResidents = summary.totalResidentes || 92; // Default to 92 if not provided
          this.totalSensors = summary.suscripcionesActivas || 99.7; // Default to 99.7 if not provided

          this.currentMonthRevenue = summary.ingresosMensual || 0; // Default to 0 if not provided
          this.totalRevenue = summary.ingresosTotales || 0; // Default to 0 if not provided
        },
        error: (error) => {
          console.error('Error loading admin summary:', error);
        }
      })

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
}
