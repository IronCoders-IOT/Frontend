import {AfterViewInit, Component, inject, ViewChild} from '@angular/core';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import {ReportRequestEntity} from '../../model/report-request.entity';
import {ReportdataApiService} from '../../services/reportdata-api.service';

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


@Component({
  selector: 'app-report-request',
  imports: [CommonModule,HeaderContentComponent, MatProgressSpinnerModule, MatTableModule, MatSortModule,
    MatPaginatorModule, DatePipe, MatFormFieldModule,MatInputModule],
  templateUrl: './report-request.component.html',
  standalone: true,
  styleUrl: './report-request.component.css'
})
export class ReportRequestComponent implements AfterViewInit {
  tittle = 'Lista de Reportes';

  requests: MatTableDataSource<ReportRequestEntity> = new MatTableDataSource<ReportRequestEntity>();

  displayedColumns: string[] = ['id', 'resident_name', 'title', 'emission_date', 'status'];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  constructor(private reportdataApiService: ReportdataApiService, private dialog: MatDialog) {}

  ngOnInit(): void {
    this.getAllRequests();

    this.requests.filterPredicate = (data: ReportRequestEntity, filter: string) => {
      return data.id.toString().toLowerCase().includes(filter);
    };
  }


  getAllRequests(): void {
    this.isLoadingResults = true;

    this.reportdataApiService.getAllRequests().subscribe(
      (response: ReportRequestEntity[]) => {
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
          return this.reportdataApiService.getAllRequests().pipe(catchError(() => observableOf(null)));
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



