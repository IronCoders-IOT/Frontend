// report-detail.component.ts - FIXED VERSION
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportdataApiService } from '../../services/reportdata-api.service';
import { HeaderContentComponent } from "../../../public/components/header-content/header-content.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {ReportRequestEntity} from '../../model/report-request.entity';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css',
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
export class ReportDetailComponent implements OnInit {
  report: ReportRequestEntity;
  showStatusOptions = false;
  statusOptions = ['RECEIVED', 'IN_PROGRESS', 'CLOSED'];

  constructor(
    private route: ActivatedRoute,
    private reportService: ReportdataApiService
  ) {
    this.report = new ReportRequestEntity(); // Initialize report to avoid undefined errors
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
      
      // Actualizar temporalmente el status en la UI
      this.report.status = newStatus;
      this.showStatusOptions = false;

      // Llamar al servicio para actualizar en la base de datos
      this.reportService.updateReport(this.report).subscribe({
        next: (updatedReport) => {
          console.log('Report status updated successfully:', updatedReport);
          this.report = updatedReport;
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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    console.log(id);

    if (id) {
      this.reportService.getReportById(id).pipe(
        switchMap((data) => {
          this.report = data;
          return this.reportService.getResidentById(data.residentId);
        })
      ).subscribe((residentData) => {
        this.report.firtsName = residentData[0].firstName;
        this.report.lastName = residentData[0].lastName;
        this.report.residentPhone = residentData[0].phone;
        this.report.residentAddress = residentData[0].address;

        console.log('Resident data loaded:', residentData);
        console.log('Report data loaded:', this.report);

      });
    }
  }
}
