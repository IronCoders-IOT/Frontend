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
  displayedColumns: string[] = ['id', 'firstName', 'requestedLiters', 'emission_date', 'delivered_at', 'status'];
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
        const userId = row.resident?.userId;
        if (userId !== undefined) {
          console.log('Modal result:', result);
          this.sensordataApiService.updateDeliveredAt(userId, result.status, result.selectedDate).subscribe(
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

  // MÉTODO CORREGIDO: Usando forkJoin para cargar todos los datos antes de mostrar
  getAllRequests(): void {
    this.isLoadingResults = true;
    
    this.sensordataApiService.getAllRequests().subscribe(
      (response: WaterRequestEntity[]) => {
        console.log('Requests obtenidas:', response);
        
        // Crear array de observables para obtener perfiles de residentes
        const residentProfileRequests = response.map(request => 
          this.sensordataApiService.getResidentProfileByResidentId(request.residentId)
            .pipe(
              map(residentProfile => {
                request.resident = residentProfile;
                console.log(`Perfil del residente para solicitud ${request.id}:`, residentProfile);
                return request;
              }),
              catchError(error => {
                console.error(`Error al obtener el perfil del residente para solicitud ${request.id}:`, error);
                request.resident = null;
                return observableOf(request);
              })
            )
        );

        // Ejecutar todas las peticiones en paralelo
        forkJoin(residentProfileRequests).subscribe(
          (requestsWithResidents) => {
            console.log('Requests con residentes:', requestsWithResidents);
            this.requests.data = requestsWithResidents;
            this.isLoadingResults = false;
            this.resultsLength = this.requests.data.length;
          },
          (error) => {
            console.error('Error al obtener perfiles de residentes:', error);
            this.requests.data = response;
            this.isLoadingResults = false;
            this.resultsLength = this.requests.data.length;
          }
        );
      },
      (error) => {
        console.error('Error al obtener requests:', error);
        this.isLoadingResults = false;
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
    
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.sensordataApiService.getAllRequests().pipe(catchError(() => observableOf(null)));
        }),
        map(data => {
          this.isLoadingResults = false;
          if (data === null) {
            return [];
          }
          this.resultsLength = data.length;
          return data;
        }),
      )
      .subscribe(data => (this.requests.data = data));
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