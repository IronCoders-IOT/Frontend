import { Component, ViewChild } from '@angular/core';

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
import { HeaderContentComponent } from '../../../../../public/components/header-content/header-content.component';
import { Event } from '../../../models/event.model';
import { EventService } from '../../../services/event.service';


@Component({
  selector: 'app-view-history',
  imports: [CommonModule,HeaderContentComponent, MatProgressSpinnerModule, MatTableModule, MatSortModule,
      MatPaginatorModule, DatePipe, MatFormFieldModule,MatInputModule],
  templateUrl: './view-history.component.html',
  styleUrl: './view-history.component.css'
})
export class ViewHistoryComponent {
      tittle = 'Historial de Eventos';

  events: MatTableDataSource<Event> = new MatTableDataSource<Event>();

  displayedColumns: string[] = ['id', 'event', 'water_quality', 'status', 'water_level'];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  constructor(private service:EventService, private dialog: MatDialog) {

  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getAllEvents();
  }
  getAllEvents(): void {
    this.isLoadingResults = true;
    this.service.getAllEvents().subscribe(
      (response: Event[]) => {
        this.events.data = response;
        this.isLoadingResults = false;
        this.resultsLength = this.events.data.length;
        console.log("Data:", this.events);
      },
      (error) => {
        console.error('Error fetching events:', error);
        this.isLoadingResults = false;
      }
    );
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  getStatusClass(status: string): string {
    switch (status) {
      case 'Normal':
        return 'status-received';
      case 'Alert':
        return 'status-in-progress';
      case 'Critical':
        return 'status-closed';
      default:
        return '';
    }
  }
}
