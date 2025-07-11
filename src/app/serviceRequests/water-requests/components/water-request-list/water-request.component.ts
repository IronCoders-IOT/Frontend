import {AfterViewInit, Component, OnInit, ViewChild, ChangeDetectorRef} from '@angular/core';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import {WaterRequestModel} from '../../model/water-request.model';
import {HttpClient} from '@angular/common/http';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule, SortDirection} from '@angular/material/sort';
import {merge, Observable, of as observableOf, forkJoin} from 'rxjs';
import {catchError, map, startWith, switchMap} from 'rxjs/operators';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule, DatePipe} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { ScheduleDateComponent } from '../schedule-date/schedule-date.component';
import { Resident } from '../../../../profiles/residents/models/resident.model';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { LanguageToggleComponent } from '../../../../shared/components/language-toggle/language-toggle.component';
import {WaterRequestApiService} from '../../services/water-request-api.service';

@Component({
  selector: 'app-water-request-list',
  imports: [CommonModule,HeaderContentComponent, MatProgressSpinnerModule, MatTableModule, MatSortModule,
    MatPaginatorModule, DatePipe, MatFormFieldModule,MatInputModule, TranslatePipe],
  templateUrl: './water-request.component.html',
  standalone: true,
  styleUrl: './water-request.component.css'
})
export class WaterRequestComponent implements AfterViewInit {
  tittle = 'Solicitud de Agua Potable';
  requests: MatTableDataSource<WaterRequestModel> = new MatTableDataSource<WaterRequestModel>();
  displayedColumns: string[] = [];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  resident = new Resident();
  username: string | null = null;
  userRole: string | null = null;
  isAdmin: boolean = false;

  constructor(
    private waterRequestApiService: WaterRequestApiService,
    private dialog: MatDialog,
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsername(); // Cargar el nombre de usuario al iniciar

    this.displayedColumns = ['id', 'firstName', 'emissionDate', 'requestedLiters', 'delivered_at', 'status'];

    this.requests.filterPredicate = (data: WaterRequestModel, filter: string) => {
      if (!filter.trim()) {
        return true;
      }

      return data.id.toString() === filter.trim();
    };
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

  openScheduleModal(row: WaterRequestModel): void {
    const dialogRef = this.dialog.open(ScheduleDateComponent, {
      width: '550px',
      data: row,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.selectedDate) {
        const requestId = row.id;
        if (requestId !== undefined) {
          console.log('Modal result:', result);
          this.waterRequestApiService.updateDeliveredAt(requestId, result.status, result.selectedDate).subscribe(
            (updatedRequest) => {
              console.log('Updated request:', updatedRequest);

              // Encontrar el índice de la fila en el array
              const rowIndex = this.requests.data.findIndex(r => r.id === row.id);
              if (rowIndex !== -1) {
                // Crear un nuevo objeto con los datos actualizados
                const updatedRow = { ...this.requests.data[rowIndex] };
                updatedRow.delivered_at = updatedRequest.delivered_at;
                updatedRow.status = updatedRequest.status;

                // ⭐ TRANSFORMAR EL STATUS AL FORMATO CORRECTO
                if (updatedRow.status === 'IN_PROGRESS') {
                  updatedRow.status = 'In Progress';
                } else if (updatedRow.status === 'CLOSED') {
                  updatedRow.status = 'Closed';
                } else if (updatedRow.status === 'RECEIVED') {
                  updatedRow.status = 'Received';
                }

                // Actualizar el array con el nuevo objeto
                const newData = [...this.requests.data];
                newData[rowIndex] = updatedRow;
                this.requests.data = newData;

                // Forzar la detección de cambios
                this.cdr.detectChanges();

                console.log('Row updated - Status:', updatedRow.status, 'Delivered_at:', updatedRow.delivered_at);
              }
            },
            (error) => {
              console.error('Error updating request:', error);
            }
          );
        } else {
          console.error('userId is undefined for resident:', row.resident);
        }
      }
    });
  }


  getAllRequests(): void {
    this.isLoadingResults = true;


    this.waterRequestApiService.getProviderProfile().subscribe(
      (providerProfile) => {
        const authenticatedProviderId = providerProfile.id;
        console.log('Proveedor autenticado:', providerProfile);


        this.waterRequestApiService.getResidentsByProviderId(authenticatedProviderId).subscribe(
          (residents) => {
            console.log('Residentes del proveedor:', residents);
            this.loadWaterRequestsForResidents(residents);
          },
          (error) => {
            console.error('Error al obtener residentes del proveedor:', error);
            this.isLoadingResults = false;
          }
        );
      },
      (error) => {
        console.warn('Error al obtener perfil del proveedor. Asumiendo que el usuario es administrador:', error);

        this.waterRequestApiService.getAllRequests().subscribe(
          (allRequests) => {
            console.log('Todas las solicitudes de agua:', allRequests);
            this.loadWaterRequestsForAdmin(); // Llama a la nueva función
          },
          (error) => {
            console.error('Error al obtener todas las solicitudes de agua:', error);
            this.requests.data = [];
            this.isLoadingResults = false;
            this.resultsLength = 0;
          }
        );
      }
    );
  }

  private loadWaterRequestsForResidents(residents: any[]): void {
    if (residents.length === 0) {
      this.requests.data = [];
      this.isLoadingResults = false;
      this.resultsLength = 0;
      return;
    }

    // Crear observables para obtener water water-requests de cada residente
    const waterRequestObservables = residents.map(resident =>
      this.waterRequestApiService.getWaterRequestsByResidentId(resident.id).pipe(
        map(requests => {
          // Asignar el residente a cada request
          return requests.map(request => {
            request.resident = resident;
            if (request.status === 'IN_PROGRESS') {
              request.status = 'In Progress';
            } else if (request.status === 'CLOSED') {
              request.status = 'Closed';
            } else if (request.status === 'RECEIVED') {
              request.status = 'Received';
            }
            return request;
          });
        }),
        catchError(error => {
          console.error(`Error al obtener requests del residente ${resident.id}:`, error);
          return observableOf([]);
        })
      )
    );

    // Ejecutar todas las peticiones en paralelo
    forkJoin(waterRequestObservables).subscribe(
      (requestArrays) => {
        // Aplanar el array de arrays y eliminar duplicados por ID
        const allRequests = requestArrays.flat();
        const uniqueRequests = this.removeDuplicates(allRequests);

        console.log('Todas las water water-requests del proveedor:', uniqueRequests);
        this.requests.data = uniqueRequests;
        this.isLoadingResults = false;
        this.resultsLength = this.requests.data.length;
      },
      (error) => {
        console.error('Error al obtener water water-requests:', error);
        this.requests.data = [];
        this.isLoadingResults = false;
        this.resultsLength = 0;
      }
    );
  }

  private loadWaterRequestsForAdmin(): void {
    // Obtener todas las water water-requests y todos los residentes en paralelo
    forkJoin({
      waterRequests: this.waterRequestApiService.getAllRequests(),
      residents: this.waterRequestApiService.getResidentsByAdmin() // o el método que tengas para admin
    }).subscribe(
      ({ waterRequests, residents }) => {
        // Crear un mapa de residentes por ID para búsqueda rápida
        const residentsMap = new Map();
        residents.forEach(resident => {
          residentsMap.set(resident.id, resident);
        });

        // Asignar el residente correspondiente a cada water request
        const formattedRequests = waterRequests.map(request => {
          // Buscar el residente por ID en el mapa
          const resident = residentsMap.get(request.residentId); // o request.resident_id, según tu modelo
          if (resident) {
            request.resident = resident;
          }

          // Formatear el status
          if (request.status === 'IN_PROGRESS') {
            request.status = 'In Progress';
          } else if (request.status === 'CLOSED') {
            request.status = 'Closed';
          } else if (request.status === 'RECEIVED') {
            request.status = 'Received';
          }

          return request;
        });

        console.log('Solicitudes de agua con residentes (admin):', formattedRequests);
        this.requests.data = formattedRequests;
        this.isLoadingResults = false;
        this.resultsLength = this.requests.data.length;
      },
      (error) => {
        console.error('Error al obtener datos para admin:', error);
        this.requests.data = [];
        this.isLoadingResults = false;
        this.resultsLength = 0;
      }
    );
  }

  applyStatusFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.requests.filter = filterValue;

    if (this.requests.paginator) {
      this.requests.paginator.firstPage();
    }
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.requests.paginator = this.paginator;
    this.requests.sort = this.sort;

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // Cargar datos iniciales solo una vez
    this.getAllRequests();

    // Configurar paginación y ordenamiento sin recargar datos
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          // Solo actualizar la vista, no recargar datos
          return observableOf([]);
        })
      )
      .subscribe();
  }
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

  // Verificar si el request está cerrado (para deshabilitar el botón schedule)
  isRequestClosed(status: string): boolean {
    return status === 'Closed';
  }

  // Función mejorada para abrir el modal solo si no está cerrado
  openScheduleModalIfAllowed(row: WaterRequestModel): void {
    if (!this.isRequestClosed(row.status)) {
      this.openScheduleModal(row);
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

  // Función para determinar si debe mostrar la fecha en lugar del botón
  shouldShowDate(row: WaterRequestModel): boolean {
    // Siempre mostrar fecha si el status es In Progress o Closed
    if (row.status === 'In Progress' || row.status === 'Closed') {
      return true;
    }

    // Mostrar fecha si hay delivered_at establecido
    return !!row.delivered_at;
  }

  // Función para obtener la fecha a mostrar
  getDisplayDate(row: WaterRequestModel): Date | string | null {
    // Si hay delivered_at establecido, mostrarlo
    if (row.delivered_at) {
      return row.delivered_at;
    }

    // Si el status es In Progress o Closed, mostrar deliveredAt de la API o fecha por defecto
    if (row.status === 'In Progress' || row.status === 'Closed') {
      // Intentar obtener deliveredAt de la API
      const apiDeliveredAt = (row as any).deliveredAt;
      if (apiDeliveredAt) {
        return apiDeliveredAt;
      }

      // Si no hay fecha de la API, mostrar la fecha de emisión como fallback
      if (row.emissionDate) {
        return row.emissionDate;
      }

      // Si no hay fecha de emisión, mostrar fecha actual
      return new Date();
    }

    return null;
  }

  // Método para eliminar duplicados por ID
  private removeDuplicates(requests: WaterRequestModel[]): WaterRequestModel[] {
    const seen = new Set();
    return requests.filter(request => {
      const duplicate = seen.has(request.id);
      seen.add(request.id);
      return !duplicate;
    });
  }
}
