import {Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
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
import { Subject, takeUntil, timer } from 'rxjs';
import {HeaderContentComponent} from '../../../../public/components/header-content/header-content.component';
import {TranslationService} from '../../../../shared/services/translation.service';

@Component({
  selector: 'app-resident-list',
  imports: [
    CommonModule,
    HeaderContentComponent,
    MatTable,
    MatTableModule,    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatRow,
    MatInput,
    RouterModule
  ],
  templateUrl: './resident-list.component.html',
  styleUrl: './resident-list.component.css'
})

export class ResidentListComponent implements OnInit, AfterViewInit, OnDestroy {
  residents: MatTableDataSource<Resident> = new MatTableDataSource<Resident>();
  displayedColumns: string[] = ['id', 'first_name', 'last_name', 'phone', 'address', 'actions'];
  dataSource: Resident[] = [];
  originalDataSource: Resident[] = [];
  isLoadingResults = true;
  resultsLength = 0;

  loading = false;
  error: string | null = null;
  retryCount = 0;
  maxRetries = 3;
  private destroy$ = new Subject<void>();

  constructor(private residentService: ResidentService,
              private router: Router,
              private translationService: TranslationService,
              private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('ResidentListComponent - ngOnInit iniciado');

    // Verificar autenticación antes de cargar datos
    if (!this.checkAuthentication()) {
      return;
    }

    // Llamar una sola vez a la carga de residentes
    this.loadResidents();

    this.residents.filterPredicate = (data: Resident, filter: string) => {
      if (!filter.trim()) {
        return true; // Si no hay filtro, muestra todos
      }
      // Convierte el ID a string y compara exactamente
      return data.id.toString() === filter.trim();
    };

    // Debug: monitorear estado cada 2 segundos por 10 segundos
    this.debugDataState();
  }

  loadResidents(): void {
    console.log('ResidentListComponent - loadResidents iniciado');
    this.loading = true;
    this.error = null;

    this.residentService.getResidents()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (residents) => {
          // Asegurar que tenemos un array válido
          const validResidents = Array.isArray(residents) ? residents : [];
          this.residents.data = validResidents;
          this.loading = false;
          this.retryCount = 0;
          this.error = null;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.retryCount++;
          // Si es 404, mostrar mensaje de "no residentes" y NO reintentar
          if (err.status === 404) {
            this.residents.data = [];
            this.error = null;
            this.cdr.detectChanges();
            return;
          }
          // Otros errores: mostrar error y NO reintentar
          this.error = 'Error al cargar los residentes.';
          this.cdr.detectChanges();
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

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngAfterViewInit(): void {
    // Solo forzar detección de cambios si hay datos cargados
    if (this.residents.data.length > 0) {
      this.cdr.detectChanges();
    }
  }

  private debugDataState(): void {
    let debugCount = 0;
    const debugInterval = setInterval(() => {
      debugCount++;
      console.log(`ResidentListComponent - Debug ${debugCount}:`, {
        loading: this.loading,
        error: this.error,
        dataLength: this.residents.data.length,
        data: this.residents.data,
        retryCount: this.retryCount
      });

      if (debugCount >= 5) {
        clearInterval(debugInterval);
      }
    }, 2000);
  }

  private checkAuthentication(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('ResidentListComponent - No hay token de autenticación');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
