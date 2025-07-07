import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SensorDataService } from '../../services/sensor-data.service';
import { ResidentSensorData, SensorEvent } from '../../model/sensor-data.model';
import { HeaderContentComponent } from '../../../public/components/header-content/header-content.component';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle/language-toggle.component';
import { TranslationService } from '../../../shared/services/translation.service';

@Component({
  selector: 'app-sensor-monitoring',
  templateUrl: './sensor-monitoring.component.html',
  styleUrls: ['./sensor-monitoring.component.css'],
  standalone: true,
  imports: [CommonModule, HeaderContentComponent]
})
export class SensorMonitoringComponent implements OnInit {
  residentSensorData: ResidentSensorData[] = [];
  selectedResident: ResidentSensorData | null = null;
  isLoading = false;
  loadError: string | null = null;
  isModalOpen = false;

  constructor(
    private sensorDataService: SensorDataService,
    private translationService: TranslationService
  ) {}

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  ngOnInit(): void {
    this.loadSensorData();
  }

  loadSensorData(): void {
    this.isLoading = true;
    this.loadError = null;

    this.sensorDataService.getCompleteSensorData().subscribe({
      next: (data) => {
        this.residentSensorData = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sensor data:', error);
        this.loadError = 'Error al cargar los datos de sensores';
        this.isLoading = false;
      }
    });
  }

  selectResident(residentData: ResidentSensorData): void {
    this.selectedResident = residentData;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedResident = null;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.isModalOpen) {
      this.closeModal();
    }
  }

  retry(): void {
    this.loadSensorData();
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'suspended': return 'status-suspended';
      default: return 'status-unknown';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'Activa';
      case 'inactive': return 'Inactiva';
      case 'suspended': return 'Suspendida';
      default: return status || 'Sin estado';
    }
  }

  getEventTypeClass(eventType: string): string {
    switch (eventType?.toLowerCase()) {
      case 'normal': return 'event-normal';
      case 'warning': return 'event-warning';
      case 'critical': return 'event-critical';
      case 'maintenance': return 'event-maintenance';
      default: return 'event-unknown';
    }
  }

  getEventTypeText(eventType: string): string {
    switch (eventType?.toLowerCase()) {
      case 'normal': return 'Normal';
      case 'warning': return 'Advertencia';
      case 'critical': return 'Crítico';
      case 'maintenance': return 'Mantenimiento';
      default: return eventType || 'Desconocido';
    }
  }

  getQualityClass(quality: string): string {
    // Mapeo de los nuevos valores de calidad del agua
    switch (quality.toLowerCase().trim()) {
      case 'excelente':
        return 'quality-excellent';
      case 'aceptable':
        return 'quality-good';
      case 'no potable':
        return 'quality-fair';
      case 'no hay agua':
      case 'error tds':
      case 'agua contaminada':
        return 'quality-poor';
      default:
        // Fallback para valores numéricos o desconocidos
        const qualityNum = parseFloat(quality);
        if (!isNaN(qualityNum)) {
          if (qualityNum >= 8) return 'quality-excellent';
          if (qualityNum >= 6) return 'quality-good';
          if (qualityNum >= 4) return 'quality-fair';
          return 'quality-poor';
        }
        return 'quality-poor';
    }
  }

  getLevelClass(level: string): string {
    const levelNum = parseFloat(level);
    if (levelNum >= 80) return 'level-high';
    if (levelNum >= 50) return 'level-medium';
    if (levelNum >= 20) return 'level-low';
    return 'level-critical';
  }

  hasActiveSensor(residentData: ResidentSensorData): boolean {
    return residentData.subscription !== null && residentData.subscription.sensorId > 0;
  }

  getLatestEvent(events: SensorEvent[]): SensorEvent | null {
    return events.length > 0 ? events[events.length - 1] : null;
  }

  // Dashboard statistics methods
  getActiveSensorsCount(): number {
    return this.residentSensorData.filter(resident => this.hasActiveSensor(resident)).length;
  }

  getTotalEventsCount(): number {
    return this.residentSensorData.reduce((total, resident) => {
      return total + (resident.sensorEvents?.length || 0);
    }, 0);
  }

  getAverageQuality(): string {
    const activeResidents = this.residentSensorData.filter(resident =>
      this.hasActiveSensor(resident) && resident.sensorEvents && resident.sensorEvents.length > 0
    );

    if (activeResidents.length === 0) {
      return '0.0';
    }

    const totalQuality = activeResidents.reduce((total, resident) => {
      const latestEvent = this.getLatestEvent(resident.sensorEvents);
      const quality = latestEvent ? parseFloat(latestEvent.qualityValue) : 0;
      return total + quality;
    }, 0);

    const average = totalQuality / activeResidents.length;
    return average.toFixed(1);
  }

  getResidentInitials(resident: ResidentSensorData): string {
    if (!resident || !resident.resident || !resident.resident.firstName) {
      return 'R';
    }

    const firstName = resident.resident.firstName.trim();
    const lastName = resident.resident.lastName?.trim() || '';

    if (!lastName) {
      return firstName.charAt(0).toUpperCase();
    } else {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }
  }
}
