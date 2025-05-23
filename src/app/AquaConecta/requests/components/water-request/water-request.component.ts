import {AfterViewInit, Component, inject, ViewChild} from '@angular/core';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import {WaterRequestEntity} from '../../model/water-request.entity';
import {SensordataApiService} from '../../services/sensordata-api.service';

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
import { MatDialog } from '@angular/material/dialog';
import { ScheduleDateComponent } from '../schedule-date/schedule-date.component';


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
  //requests:  Array<WaterRequestEntity> = [];
  requests: MatTableDataSource<WaterRequestEntity> = new MatTableDataSource<WaterRequestEntity>();

  displayedColumns: string[] = ['id', 'resident_name', 'requested_liters', 'emission_date', 'delivered_at', 'status'];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  constructor(private sensordataApiService: SensordataApiService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getAllRequests();

    this.requests.filterPredicate = (data: WaterRequestEntity, filter: string) => {
      return data.id.toString().toLowerCase().includes(filter);
    };
  }

openScheduleModal(row: WaterRequestEntity): void {
  const dialogRef = this.dialog.open(ScheduleDateComponent, {
    width: '550px',
    data: row, // Pasamos la información de la fila al modal
  });

  dialogRef.afterClosed().subscribe((result) => {
    if (result && result.selectedDate) {
      console.log('Modal result:', result);

      // Actualiza la fecha en la fila correspondiente
      row.delivered_at = result.selectedDate;
      row.status = result.status || row.status; // Por si se envía el status desde el modal

      // Refresca la tabla para reflejar el cambio en la UI
      this.requests.data = [...this.requests.data];
    }
  });
}
  getAllRequests(): void {
    this.isLoadingResults = true;

    this.sensordataApiService.getAllRequests().subscribe(
      (response: WaterRequestEntity[]) => {
        //this.requests = response;
        this.requests.data= response;

        this.isLoadingResults = false;
        this.resultsLength = this.requests.data.length;
        console.log(this.requests);
      }

    );
  }

  applyStatusFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.requests.filter = filterValue; // Aplica el filtro directamente
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

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



