import {Component, OnInit, AfterViewInit, ChangeDetectorRef, OnDestroy} from '@angular/core';
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
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../shared/services/translation.service';
import { Subject, takeUntil, timer } from 'rxjs';

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
    
    // Usar timer para dar tiempo a la inicialización completa
    timer(100).pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadResidents();
    });

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
          console.log('ResidentListComponent - Residentes obtenidos:', residents);
          console.log('ResidentListComponent - Número de residentes:', residents?.length || 0);
          
          // Asegurar que tenemos un array válido
          const validResidents = Array.isArray(residents) ? residents : [];
          
          this.residents.data = validResidents;
          this.loading = false;
          this.retryCount = 0; // Reset retry count on success
          
          console.log('ResidentListComponent - MatTableDataSource actualizado');
          console.log('ResidentListComponent - Datos en la tabla:', this.residents.data);
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          
          // Timeout adicional para asegurar renderizado
          setTimeout(() => {
            console.log('ResidentListComponent - Timeout ejecutado, datos finales:', this.residents.data);
            this.cdr.detectChanges();
          }, 100);
        },
        error: (err) => {
          console.error('ResidentListComponent - Error al obtener residentes:', err);
          this.loading = false;
          this.retryCount++;
          
          // Intentar reintento automático
          if (this.retryCount <= this.maxRetries) {
            console.log(`ResidentListComponent - Reintento ${this.retryCount}/${this.maxRetries} en 2 segundos`);
            this.error = `Error al cargar los residentes. Reintentando... (${this.retryCount}/${this.maxRetries})`;
            timer(2000).pipe(takeUntil(this.destroy$)).subscribe(() => {
              this.loadResidents();
            });
          } else {
            this.error = 'Error al cargar los residentes después de varios intentos';
          }
          
          this.cdr.detectChanges();

          // Manejar error de autenticación
          if (err.message && err.message.includes('401')) {
            console.log('ResidentListComponent - Error 401, redirigiendo al login');
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
    console.log('ResidentListComponent - ngAfterViewInit');
    // Verificar si hay datos cargados y forzar detección de cambios si es necesario
    if (this.residents.data.length > 0) {
      console.log('ResidentListComponent - Datos ya cargados, forzando detección de cambios');
      this.cdr.detectChanges();
    } else if (!this.loading && !this.error) {
      console.log('ResidentListComponent - No hay datos pero tampoco carga/error, reintentando carga');
      this.loadResidents();
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
