import {Component, OnInit} from '@angular/core';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import {CommonModule} from '@angular/common';
import {MatTableDataSource} from '@angular/material/table';
import { Router } from '@angular/router';
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

  loading = false;
  error: string | null = null;

  constructor(private residentService: ResidentService,
              private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadResidents();

    this.residents.filterPredicate = (data: Resident, filter: string) => {
      if (!filter.trim()) {
        return true; // Si no hay filtro, muestra todos
      }
      // Convierte el ID a string y compara exactamente
      return data.id.toString() === filter.trim();
    };
  }

  loadResidents(): void {
    this.loading = true;
    this.error = null;

    this.residentService.getResidents().subscribe({
      next: (residents) => {
        console.log('Residentes obtenidos:', residents);
        this.residents.data = residents;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener residentes:', err);
        this.error = 'Error al cargar los residentes';
        this.loading = false;

        // Manejar error de autenticación
        if (err.message && err.message.includes('401')) {
          localStorage.removeItem('auth_token');
          this.router.navigate(['/login']);
        }
      }
    });
  }

  applyStatusFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim();
    this.residents.filter = filterValue; // No convertir a lowercase

    // Opcional: resetear la paginación cuando se aplica un filtro
    if (this.residents.paginator) {
      this.residents.paginator.firstPage();
    }
  }

/*
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
*/

}
