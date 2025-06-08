import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import {WaterRequestEntity} from '../../model/water-request.entity';
import {SensordataApiService} from '../../services/sensordata-api.service';
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
import { Resident } from '../../../residents/models/resident.model';

@Component({
  selector: 'app-water-request',
  imports: [CommonModule,HeaderContentComponent, MatProgressSpinnerModule, MatTableModule, MatSortModule,
    MatPaginatorModule, DatePipe, MatFormFieldModule,MatInputModule],
  templateUrl: './water-request.component.html',
  standalone: true,
  styleUrl: './water-request.component.css'
})
export class WaterRequestComponent implements AfterViewInit {
  tittle = 'Solicitud de Agua Potable';
  requests: MatTableDataSource<WaterRequestEntity> = new MatTableDataSource<WaterRequestEntity>();
  displayedColumns: string[] = ['id', 'firstName', 'requestedLiters', 'emissionDate', 'delivered_at', 'status'];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  resident = new Resident();

  constructor(private sensordataApiService: SensordataApiService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getAllRequests();
    this.requests.filterPredicate = (data: WaterRequestEntity, filter: string) => {
      if (!filter.trim()) {
        return true;
      }
      return data.id.toString() === filter.trim();
    };
  }

  openScheduleModal(row: WaterRequestEntity): void {
    const dialogRef = this.dialog.open(ScheduleDateComponent, {
      width: '550px',
      data: row,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.selectedDate) {
        const requestId = row.id;
        if (requestId !== undefined) {
          console.log('Modal result:', result);
          this.sensordataApiService.updateDeliveredAt(requestId, result.status, result.selectedDate).subscribe(
            (updatedRequest) => {
              console.log('Updated request:', updatedRequest);
              row.delivered_at = updatedRequest.delivered_at;
              row.status = updatedRequest.status;
              this.requests.data = [...this.requests.data];
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

  // MÉTODO CORREGIDO: Filtra por proveedor autenticado
  getAllRequests(): void {
    this.isLoadingResults = true;

    // Obtener perfil del proveedor autenticado
    this.sensordataApiService.getProviderProfile().subscribe(
      (providerProfile) => {
        const authenticatedProviderId = providerProfile.userId;
        console.log('Proveedor autenticado:', providerProfile);

        // Obtener residentes del proveedor
        this.sensordataApiService.getResidentsByProviderId(authenticatedProviderId).subscribe(
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
        console.error('Error al obtener perfil del proveedor:', error);
        this.isLoadingResults = false;
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

    // Crear observables para obtener water requests de cada residente
    const waterRequestObservables = residents.map(resident =>
      this.sensordataApiService.getWaterRequestsByResidentId(resident.id).pipe(
        map(requests => {
          // Asignar el residente a cada request
          return requests.map(request => {
            request.resident = resident;
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
        // Aplanar el array de arrays
        const allRequests = requestArrays.flat();

        console.log('Todas las water requests del proveedor:', allRequests);
        this.requests.data = allRequests;
        this.isLoadingResults = false;
        this.resultsLength = this.requests.data.length;
      },
      (error) => {
        console.error('Error al obtener water requests:', error);
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

    // TAMBIÉN NECESITAS ACTUALIZAR ESTE MÉTODO PARA QUE RESPETE EL FILTRO
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          // Llamar al método que filtra por proveedor
          this.getAllRequests();
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
}
