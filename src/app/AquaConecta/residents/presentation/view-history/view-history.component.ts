import { Component, ViewChild } from '@angular/core';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CommonModule} from '@angular/common';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import { HeaderContentComponent } from '../../../../public/components/header-content/header-content.component';
import { Event } from '../../models/event.model';
import { ResidentService } from '../../services/resident.service';
import { Resident } from '../../models/resident.model';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-view-history',
  imports: [CommonModule, HeaderContentComponent, MatProgressSpinnerModule, MatTableModule, MatSortModule,
      MatPaginatorModule, MatFormFieldModule, MatInputModule],
  templateUrl: './view-history.component.html',
  styleUrl: './view-history.component.css'
})
export class ViewHistoryComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort; 
  tittle = 'Historial de Eventos';
  resident!: Resident;
  events: MatTableDataSource<Event> = new MatTableDataSource<Event>();

  displayedColumns: string[] = ['id', 'event', 'water_quality', 'status', 'water_level'];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  constructor(private service: ResidentService,private route: ActivatedRoute) {
    
  }
  ngOnInit(): void {
    //const residentId = +this.route.snapshot.paramMap.get('1')!;
    this.getResidentById(1);
    this.getAllEventsByResidentId(1);
  }
  getAllEvents(): void {
    this.isLoadingResults = true;

    this.service.getAllResidents().subscribe({
      next: (residents: Resident[]) => {
        // Extraer todos los eventos
        let allEvents: Event[] = [];

        residents.forEach((resident, index) => {
          if (resident.sensor_events) {
            resident.sensor_events.forEach((event: any) => {
              allEvents.push({
                id: index + 1, // o generar ID único si lo necesitas
                event_type: event.event,
                quality_value: event.water_quality,
                status: event.status,
                level_value: event.water_level
              });
            });
          }
        });

        this.events.data = allEvents;
        this.events.paginator = this.paginator;
        this.events.sort = this.sort;
        this.resultsLength = allEvents.length;
        this.isLoadingResults = false;
      },
      error: (error) => {
        console.error('Error fetching residents:', error);
        this.isLoadingResults = false;
      }
    });
  }
  getResidentById(id: number): void {
    this.service.getResidentById(id).subscribe({
      next: (resident: Resident) => {
        this.resident = resident;
      },
      error: (error) => {
        console.error('Error fetching resident:', error);
      }
    });
  }
  getAllEventsByResidentId(id: number): void {
    this.isLoadingResults = true;

    this.service.getAllEventsByResidentId(id).subscribe({
      next: (events) => {
        this.events.data = events;
        this.events.paginator = this.paginator;
        this.events.sort = this.sort;
        this.resultsLength = events.length;
        this.isLoadingResults = false;
      },
      error: (error) => {
        console.error('Error fetching events:', error);
        this.isLoadingResults = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Normal':
        return 'status-normal';
      case 'Alert':
        return 'status-alert';
      case 'Critical':
        return 'status-critical';
      default:
        return '';
    }
  }
}
