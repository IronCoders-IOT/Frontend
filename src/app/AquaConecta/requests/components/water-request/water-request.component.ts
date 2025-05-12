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
import {DatePipe} from '@angular/common';

import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';


@Component({
  selector: 'app-water-request',
  imports: [HeaderContentComponent, MatProgressSpinnerModule, MatTableModule, MatSortModule,
    MatPaginatorModule, DatePipe, MatFormFieldModule,MatInputModule],
  templateUrl: './water-request.component.html',
  standalone: true,
  styleUrl: './water-request.component.css'
})
export class WaterRequestComponent implements AfterViewInit {
  tittle = 'Solicitud de Agua Potable';
  //requests:  Array<WaterRequestEntity> = [];
  requests: MatTableDataSource<WaterRequestEntity> = new MatTableDataSource<WaterRequestEntity>();

  displayedColumns: string[] = ['id', 'resident_id', 'provider_id', 'request_liters', 'status', 'delivered_at'];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  constructor(private sensordataApiService: SensordataApiService) {}

  ngOnInit(): void {
    this.getAllRequests();
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

}



