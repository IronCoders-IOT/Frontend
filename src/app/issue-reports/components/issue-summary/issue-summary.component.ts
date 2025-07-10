// issue-summary.component.ts - FIXED VERSION
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportdataApiService } from '../../services/reportdata-api.service';
import { HeaderContentComponent } from "../../../public/components/header-content/header-content.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {IssueReportModel} from '../../model/issue-report.model';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../../../iam/application/services/auth.service';
import { User } from '../../../iam/domain/models/user.model';

@Component({
  selector: 'app-report-detail',
  templateUrl: './issue-summary.component.html',
  styleUrl: './issue-summary.component.css',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    HeaderContentComponent,
    MatButtonModule,
    MatIconModule
  ],
})
export class IssueSummaryComponent implements OnInit {
  report: IssueReportModel;
  showStatusOptions = false;
  statusOptions = ['RECEIVED', 'IN_PROGRESS', 'CLOSED'];
  currentUser: User | null = null;
  isAdmin: boolean = false;
  isProvider: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportdataApiService,
    private authService: AuthService
  ) {
    this.report = new IssueReportModel(); // Initialize report to avoid undefined errors
  }

  // Formatear status para mostrar al usuario
  formatStatusForDisplay(status: string): string {
    switch (status) {
      case 'RECEIVED':
        return 'received';
      case 'IN_PROGRESS':
        return 'in progress';
      case 'CLOSED':
        return 'closed';
      default:
        return status?.toLowerCase() || 'unknown';
    }
  }

  // Obtener clase CSS para el status
  getStatusClass(status: string): string {
    switch (status) {
      case 'RECEIVED':
        return 'status-received';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'CLOSED':
        return 'status-closed';
      default:
        return 'status-unknown';
    }
  }

  // Toggle del dropdown de status
  toggleStatusOptions(): void {
    this.showStatusOptions = !this.showStatusOptions;
  }

  // Actualizar status del reporte
  updateReportStatus(newStatus: string): void {
    if (this.report.id && newStatus !== this.report.status) {
      const originalStatus = this.report.status;

      const residentData = {
        firtsName: this.report.firtsName,
        lastName: this.report.lastName,
        residentPhone: this.report.residentPhone,
        residentAddress: this.report.residentAddress
      };

      // Actualizar temporalmente el status en la UI
      this.report.status = newStatus;
      this.showStatusOptions = false;

      // Llamar al servicio para actualizar en la base de datos
      this.reportService.updateReport(this.report).subscribe({
        next: (updatedReport) => {
          console.log('Report status updated successfully:', updatedReport);
          this.report = { ...updatedReport, ...residentData };
        },
        error: (error) => {
          console.error('Error updating report status:', error);
          // Revertir el cambio si hay error
          this.report.status = originalStatus;
          alert('Error al actualizar el status del reporte. Inténtalo de nuevo.');
        }
      });
    } else {
      this.showStatusOptions = false;
    }
  }

  // Cerrar dropdown si se hace clic fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const statusDropdown = target.closest('.status-dropdown');

    if (!statusDropdown) {
      this.showStatusOptions = false;
    }
  }

  onClickOutside(): void {
    this.showStatusOptions = false;
  }

  // Método para mostrar información adicional solo para admins
  showAdminInfo(): boolean {
    return this.isAdmin;
  }

  // Método para mostrar información limitada para proveedores
  showProviderInfo(): boolean {
    return this.isProvider;
  }

  ngOnInit(): void {
    // Get current user and determine role
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.determineUserRole();
      this.loadReportData();
    });
  }

  private determineUserRole(): void {
    if (!this.currentUser) {
      console.error('No hay usuario autenticado');
      return;
    }

    // Determinar el rol basado en el username o roles del usuario
    this.isAdmin = !!(this.currentUser.username?.includes('admin') || 
                   this.currentUser.roles?.includes('ADMIN') ||
                   this.currentUser.roles?.includes('ROLE_ADMIN'));
    
    this.isProvider = !this.isAdmin;
    
    console.log('Usuario actual:', this.currentUser);
    console.log('Es admin:', this.isAdmin);
    console.log('Es proveedor:', this.isProvider);
  }

  private loadReportData(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Loading report with ID:', id);

    if (id) {
      if (this.isAdmin) {
        this.loadReportForAdmin(id);
      } else {
        this.loadReportForProvider(id);
      }
    }
  }

  private loadReportForAdmin(id: string): void {
    console.log('Cargando reporte como ADMIN');
    
    // Admin usa el endpoint directo
    this.reportService.getReportById(id).pipe(
      switchMap((data) => {
        this.report = data;
        console.log('Report data loaded (ADMIN):', this.report);
        return this.reportService.getResidentById(data.residentId);
      })
    ).subscribe((residentData) => {
      this.report.firtsName = residentData[0].firstName;
      this.report.lastName = residentData[0].lastName;
      this.report.residentPhone = residentData[0].phone;
      this.report.residentAddress = residentData[0].address;

      console.log('Resident data loaded (ADMIN):', residentData);
      console.log('Final report data (ADMIN):', this.report);
    });
  }

  private loadReportForProvider(id: string): void {
    console.log('Cargando reporte como PROVIDER');
    
    // Provider usa el mismo endpoint pero con contexto diferente
    this.reportService.getReportById(id).pipe(
      switchMap((data) => {
        this.report = data;
        console.log('Report data loaded (PROVIDER):', this.report);
        return this.reportService.getResidentById(data.residentId);
      })
    ).subscribe((residentData) => {
      this.report.firtsName = residentData[0].firstName;
      this.report.lastName = residentData[0].lastName;
      this.report.residentPhone = residentData[0].phone;
      this.report.residentAddress = residentData[0].address;

      console.log('Resident data loaded (PROVIDER):', residentData);
      console.log('Final report data (PROVIDER):', this.report);
    });
  }
}
