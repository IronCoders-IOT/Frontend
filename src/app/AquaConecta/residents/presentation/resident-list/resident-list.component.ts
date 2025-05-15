import {Component, OnInit} from '@angular/core';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import {CommonModule} from '@angular/common';
import {MatTableDataSource} from '@angular/material/table';
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
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-resident-list',
  imports: [
    CommonModule,
    HeaderContentComponent,
    MatTable,
    MatTableModule,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatRow,
    MatInput,
    RouterModule
  ],
  templateUrl: './resident-list.component.html',
  styleUrl: './resident-list.component.css'
})
export class ResidentListComponent implements OnInit {
  residents: MatTableDataSource<Resident> = new MatTableDataSource<Resident>();
displayedColumns: string[] = ['id', 'first_name', 'last_name', 'phone', 'address', 'actions'];	
  dataSource: Resident[] = [];
  originalDataSource: Resident[] = [];
  isLoadingResults = true;
  resultsLength = 0;


  constructor(private residentService: ResidentService) {}

  ngOnInit(): void {
    this.getAllResidents();
  }

  getAllResidents(): void {
    this.isLoadingResults = true;
  this.residentService.getAllResidents().subscribe(
  (response: Resident[]) => {
    this.residents.data = response;
    this.isLoadingResults = false;
    this.resultsLength = this.residents.data.length;
    console.log(this.residents);
  }
);
}


}
