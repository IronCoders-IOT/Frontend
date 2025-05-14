import {Component, OnInit} from '@angular/core';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import {CommonModule} from '@angular/common';
import {
  MatCell,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderRow,
  MatRow,
  MatTable,
  MatTableModule
} from '@angular/material/table';
import {MatInput} from '@angular/material/input';
import {RouterLink, RouterModule} from '@angular/router';
import {Resident} from '../../models/resident.model';
import {ResidentService} from '../../services/resident.service';

@Component({
  selector: 'app-resident-list',
  imports: [
    CommonModule,
    HeaderContentComponent,
    MatTable,
    MatTableModule,
    MatColumnDef,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatInput,
    RouterModule,
    RouterLink
  ],
  templateUrl: './resident-list.component.html',
  styleUrl: './resident-list.component.css'
})
export class ResidentListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'firstName', 'lastName', 'phone', 'address'];
  dataSource: Resident[] = [];
  originalDataSource: Resident[] = [];

  constructor(private residentService: ResidentService) {}

  ngOnInit(): void {
    this.loadResidents();
  }

  loadResidents(): void {
    this.residentService.getAllResidents().subscribe({
      next: (residents) => {
        this.dataSource = residents;
        this.originalDataSource = [...residents];
      },
      error: (error) => {
        console.error('Error loading residents:', error);
      }
    });
  }

  applyFilter(event:Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase();

    if (!filterValue) {
      this.dataSource = [...this.originalDataSource];
      return;
    }

    this.dataSource = this.originalDataSource.filter(resident =>
      resident.id?.toString().includes(filterValue) ||
      resident.firstName.toLowerCase().includes(filterValue) ||
      resident.lastName.toLowerCase().includes(filterValue)
    );
  }

}
