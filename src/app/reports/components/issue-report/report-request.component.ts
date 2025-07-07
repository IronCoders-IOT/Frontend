import {AfterViewInit, Component, inject, ViewChild} from '@angular/core';
import {HeaderContentComponent} from '../../../public/components/header-content/header-content.component';
import {ReportRequestEntity} from '../../model/report-request.entity';

import {HttpClient} from '@angular/common/http';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule, SortDirection} from '@angular/material/sort';
import {merge, Observable, of as observableOf} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule, DatePipe} from '@angular/common';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {ReportdataApiService} from '../../services/reportdata-api.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle/language-toggle.component';

// Interfaz para el proveedor
interface Provider {
  id: number;
  taxName: string;
}

@Component({
  selector: 'app-issue-report',
  imports: [CommonModule, HeaderContentComponent, MatProgressSpinnerModule, MatTableModule, MatSortModule,
    MatPaginatorModule, DatePipe, MatFormFieldModule, MatInputModule, MatSelectModule, TranslatePipe],
  templateUrl: './report-request.component.html',
  standalone: true,
  styleUrl: './report-request.component.css'
})
export class ReportRequestComponent implements AfterViewInit {
  username: string | null = null;
  userRole: string | null = null;
  isAdmin: boolean = false;

  // Variables para el filtro de proveedores
  providers: Provider[] = [];
  selectedProviderId: number | null = null;
  allReports: ReportRequestEntity[] = []; // Guardamos todos los reportes originales

  goToDetail(id: number): void {
    this.router.navigate(['/reports', id]);
  }

  tittle = 'Lista de Reportes';

  requests: MatTableDataSource<ReportRequestEntity> = new MatTableDataSource<ReportRequestEntity>();

  displayedColumns: string[] = ['id', 'resident_name', 'title', 'emissionDate', 'status'];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  constructor(private router: Router,
              private reportdataApiService: ReportdataApiService,
              private dialog: MatDialog,
              private translationService: TranslationService) {}

  ngAfterViewInit(): void {
    // Implementar lógica necesaria aquí
  }

  ngOnInit(): void {
    this.loadUsername();
    this.getAllRequests();
    this.requests.filterPredicate = (data: ReportRequestEntity, filter: string) => {
      return data.id.toString().toLowerCase().includes(filter);
    };

    // Cargar proveedores solo si es admin
    if (this.isAdmin) {
      this.loadProviders();
    }
  }

  private loadUsername(): void {
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.username = user?.username || null;
        this.isAdmin = this.username === "admin";
        console.log(this.username);
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        this.username = null;
        this.userRole = 'Provider';
        this.isAdmin = false;
      }
    }
  }

  // Método para cargar todos los proveedores
  private loadProviders(): void {
    this.reportdataApiService.getAllProviders().subscribe(
      (providers: Provider[]) => {
        this.providers = providers;
        console.log('Providers loaded:', this.providers);
      },
      error => {
        console.error('Error loading providers:', error);
      }
    );
  }

  // Método para filtrar por proveedor
  onProviderChange(providerId: number | null): void {
    this.selectedProviderId = providerId;

    if (providerId === null) {
      // Mostrar todos los reportes
      this.requests.data = this.allReports;
    } else {
      // Filtrar reportes por providerId
      const filteredReports = this.allReports.filter(report => report.providerId === providerId);
      this.requests.data = filteredReports;
    }

    this.resultsLength = this.requests.data.length;
  }

  getAllRequests(): void {
    this.isLoadingResults = true;

    if (this.isAdmin) {
      this.reportdataApiService.getAllReports().subscribe(
        (response) => {
          console.log('All reports:', response);

          response.forEach((report) => {
            // Formatear el status de cada reporte
            if (report.status === 'IN_PROGRESS') {
              report.status = 'In Progress';
            } else if (report.status === 'CLOSED') {
              report.status = 'Closed';
            } else if (report.status === 'RECEIVED') {
              report.status = 'Received';
            }

            this.reportdataApiService.getResidentById(report.residentId).subscribe(
              (residentProfile) => {
                report.resident = residentProfile;
              },
              error => {
                console.error(`Error loading resident profile for report ID ${report.id}:`, error);
              }
            );
          });

          // Guardar todos los reportes para el filtrado
          this.allReports = response;
          this.requests.data = response;
          this.isLoadingResults = false;
          this.resultsLength = this.requests.data.length;
          console.log('Reports loaded:', this.requests.data);
        },
        error => {
          console.error('Error loading reports:', error);
          this.isLoadingResults = false;
        }
      );
    } else {
      this.reportdataApiService.getProviderProfile().subscribe(
        (providerProfile) => {
          const authenticatedProviderId = providerProfile.id;
          console.log('ProveedorID autenticado:', providerProfile.id);

          this.reportdataApiService.getReportsByProviderId(authenticatedProviderId).subscribe(
            (response: ReportRequestEntity[]) => {
              console.log('Reports for provider:', response);

              response.forEach((report) => {
                if (report.status === 'IN_PROGRESS') {
                  report.status = 'In Progress';
                } else if (report.status === 'CLOSED') {
                  report.status = 'Closed';
                } else if (report.status === 'RECEIVED') {
                  report.status = 'Received';
                }
                this.reportdataApiService.getResidentById(report.residentId).subscribe(
                  (residentProfile) => {
                    report.resident = residentProfile;
                  },
                  error => {
                    console.error(`Error loading resident profile for report ID ${report.id}:`, error);
                  }
                );
              });

              this.allReports = response;
              this.requests.data = response;
              this.isLoadingResults = false;
              this.resultsLength = this.requests.data.length;
              console.log('Reports loaded:', this.requests.data);
            },
            error => {
              console.error('Error loading reports for provider:', error);
              this.isLoadingResults = false;
            }
          );
        },
        error => {
          console.error('Error loading reports:', error);
          this.isLoadingResults = false;
        }
      );
    }
  }

  applyStatusFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.requests.filter = filterValue;
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  getStatusClass(status: string): string {
    switch (status) {
      case 'Received':
        return 'status-received';
      case 'In Progress':
        return 'status-in-progress';
      case 'Closed':
        return 'status-closed';
      default:
        return '';
    }
  }

  getTranslatedStatus(status: string): string {
    switch (status) {
      case 'Received': return this.translationService.translate('received');
      case 'In Progress': return this.translationService.translate('in_progress');
      case 'Closed': return this.translationService.translate('closed');
      case 'ACTIVE': return this.translationService.translate('active');
      case 'INACTIVE': return this.translationService.translate('inactive');
      default: return status;
    }
  }
}
