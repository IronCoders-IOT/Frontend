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
  selectedSensor: any = null;
  isLoading = false;
  loadError: string | null = null;
  isModalOpen = false;
  isDetailModalOpen = false;
  modalStep: 'sensors' | 'details' = 'sensors';

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
        this.loadError = this.translate('error_loading_sensor_data');
        this.isLoading = false;
      }
    });
  }

  selectResident(residentData: ResidentSensorData): void {
    this.selectedResident = residentData;
    this.selectedSensor = null;
    this.modalStep = 'sensors';
    this.isModalOpen = true;
  }

  selectSensor(sensor: any): void {
    this.selectedSensor = sensor;
    this.modalStep = 'details';
  }

  backToSensorList(): void {
    this.selectedSensor = null;
    this.modalStep = 'sensors';
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedResident = null;
    this.selectedSensor = null;
    this.modalStep = 'sensors';
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
      case 'active': return this.translate('status_active');
      case 'inactive': return this.translate('status_inactive');
      case 'suspended': return this.translate('status_suspended');
      default: return status || this.translate('status_unknown');
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
      case 'normal': return this.translate('event_normal');
      case 'warning': return this.translate('event_warning');
      case 'critical': return this.translate('event_critical');
      case 'maintenance': return this.translate('event_maintenance');
      default: return eventType || this.translate('event_unknown');
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
    return residentData.subscriptions && residentData.subscriptions.length > 0 && 
           residentData.subscriptions.some(sub => sub.status.toLowerCase() === 'active');
  }

  getLatestEvent(events: SensorEvent[]): SensorEvent | null {
    return events.length > 0 ? events[events.length - 1] : null;
  }

  // Método para obtener la primera suscripción activa (para compatibilidad con el template actual)
  getActiveSubscription(residentData: ResidentSensorData): any {
    return residentData.subscriptions?.find(sub => sub.status.toLowerCase() === 'active') || null;
  }

  // Método para obtener todas las suscripciones activas
  getActiveSubscriptions(residentData: ResidentSensorData): any[] {
    return residentData.subscriptions?.filter(sub => sub.status.toLowerCase() === 'active') || [];
  }

  // Dashboard statistics methods
  getActiveSensorsCount(): number {
    return this.residentSensorData.reduce((total, resident) => {
      const activeSubscriptions = resident.subscriptions?.filter(sub => sub.status.toLowerCase() === 'active') || [];
      return total + activeSubscriptions.length;
    }, 0);
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

  // Método para obtener eventos específicos de un sensor de un residente específico
  getSensorEventsForResident(sensorId: number, residentData: ResidentSensorData): SensorEvent[] {
    return residentData.sensorEvents.filter(event => event.sensorId === sensorId);
  }

  // Método para obtener el último evento de un sensor específico de un residente específico
  getLatestEventForSensorOfResident(sensorId: number, residentData: ResidentSensorData): SensorEvent | null {
    const events = this.getSensorEventsForResident(sensorId, residentData);
    return events.length > 0 ? events[events.length - 1] : null;
  }

  // Método para obtener eventos específicos de un sensor
  getSensorEvents(sensorId: number): SensorEvent[] {
    if (!this.selectedResident) return [];
    return this.selectedResident.sensorEvents.filter(event => event.sensorId === sensorId);
  }

  // Método para obtener el último evento de un sensor específico
  getLatestEventForSensor(sensorId: number): SensorEvent | null {
    const events = this.getSensorEvents(sensorId);
    return events.length > 0 ? events[events.length - 1] : null;
  }

  // Método para verificar si un sensor tiene eventos recientes
  hasSensorActivity(sensorId: number): boolean {
    return this.getSensorEvents(sensorId).length > 0;
  }

  // Nuevas funciones para el resumen inteligente del card

  // Obtener rango de calidad de todos los sensores activos
  getQualityRange(residentData: ResidentSensorData): string {
    const activeSubscriptions = this.getActiveSubscriptions(residentData);
    if (activeSubscriptions.length === 0) return 'N/A';

    const qualities: string[] = [];
    activeSubscriptions.forEach(subscription => {
      const latestEvent = this.getLatestEventForSensorOfResident(subscription.sensorId, residentData);
      if (latestEvent) {
        qualities.push(latestEvent.qualityValue);
      }
    });

    if (qualities.length === 0) return 'N/A';

    const uniqueQualities = [...new Set(qualities)];
    
    if (uniqueQualities.length === 1) {
      return uniqueQualities[0];
    }
    
    // Ordenar de mejor a peor: excelente, aceptable, no potable, y los críticos al final
    const qualityOrder = ['excelente', 'aceptable', 'no potable', 'no hay agua', 'error tds', 'agua contaminada'];
    const sortedQualities = uniqueQualities.sort((a, b) => {
      const indexA = qualityOrder.indexOf(a.toLowerCase().trim());
      const indexB = qualityOrder.indexOf(b.toLowerCase().trim());
      return indexA - indexB;
    });

    return `${sortedQualities[0]} - ${sortedQualities[sortedQualities.length - 1]}`;
  }

  // Verificar si hay sensores críticos (calidad mala o nivel bajo)
  hasCriticalSensors(residentData: ResidentSensorData): boolean {
    const activeSubscriptions = this.getActiveSubscriptions(residentData);
    
    return activeSubscriptions.some(subscription => {
      const latestEvent = this.getLatestEventForSensorOfResident(subscription.sensorId, residentData);
      if (latestEvent) {
        const levelValue = typeof latestEvent.levelValue === 'string' ? 
          parseFloat(latestEvent.levelValue) : latestEvent.levelValue;
        const qualityLower = latestEvent.qualityValue.toLowerCase().trim();
        const isBadQuality = ['no potable', 'no hay agua', 'error tds', 'agua contaminada'].includes(qualityLower);
        return isBadQuality || levelValue < 30;
      }
      return false;
    });
  }

  // Contar sensores críticos
  getCriticalSensorsCount(residentData: ResidentSensorData): number {
    const activeSubscriptions = this.getActiveSubscriptions(residentData);
    
    return activeSubscriptions.filter(subscription => {
      const latestEvent = this.getLatestEventForSensorOfResident(subscription.sensorId, residentData);
      if (latestEvent) {
        const levelValue = typeof latestEvent.levelValue === 'string' ? 
          parseFloat(latestEvent.levelValue) : latestEvent.levelValue;
        const qualityLower = latestEvent.qualityValue.toLowerCase().trim();
        const isBadQuality = ['no potable', 'no hay agua', 'error tds', 'agua contaminada'].includes(qualityLower);
        return isBadQuality || levelValue < 30;
      }
      return false;
    }).length;
  }

  // Obtener estado general de los sensores
  getSensorsStatusSummary(residentData: ResidentSensorData): string {
    const activeSubscriptions = this.getActiveSubscriptions(residentData);
    if (activeSubscriptions.length === 0) return this.translate('no_sensors');

    const totalSensors = activeSubscriptions.length;
    const criticalCount = this.getCriticalSensorsCount(residentData);
    const goodCount = totalSensors - criticalCount;

    if (totalSensors === 1) {
      return criticalCount > 0 ? this.translate('critical_status') : this.translate('normal_status');
    }

    if (criticalCount === 0) {
      return `${totalSensors} ${this.translate('sensors_normal')}`;
    } else if (criticalCount === totalSensors) {
      return `${totalSensors} ${this.translate('sensors_critical')}`;
    } else {
      return `${goodCount} ${this.translate('sensors_ok')}, ${criticalCount} ${this.translate('sensors_critical_short')}`;
    }
  }

  // Obtener la calidad promedio
  getAverageQualityForResident(residentData: ResidentSensorData): string {
    const activeSubscriptions = this.getActiveSubscriptions(residentData);
    if (activeSubscriptions.length === 0) return 'N/A';

    const qualities: string[] = [];
    activeSubscriptions.forEach(subscription => {
      const latestEvent = this.getLatestEventForSensorOfResident(subscription.sensorId, residentData);
      if (latestEvent) {
        qualities.push(latestEvent.qualityValue);
      }
    });

    if (qualities.length === 0) return 'N/A';

    // Convertir calidades a números para calcular promedio
    const qualityValues: number[] = qualities.map(q => {
      const qualityLower = q.toLowerCase().trim();
      switch(qualityLower) {
        case 'excelente': return 4;
        case 'aceptable': return 3;
        case 'no potable': return 2;
        case 'no hay agua':
        case 'error tds':
        case 'agua contaminada': return 1;
        default: return 0;
      }
    });

    const sum = qualityValues.reduce((accumulator, current) => accumulator + current, 0);
    const average = sum / qualityValues.length;
    
    if (average >= 3.5) return 'excelente';
    if (average >= 2.5) return 'aceptable';
    if (average >= 1.5) return 'no potable';
    return 'agua contaminada';
  }

  // Obtener calidad promedio actual de todos los sensores activos
  getCurrentQualitySummary(residentData: ResidentSensorData): string {
    const activeSubscriptions = this.getActiveSubscriptions(residentData);
    if (activeSubscriptions.length === 0) return 'N/A';

    const qualities: string[] = [];
    activeSubscriptions.forEach(subscription => {
      const latestEvent = this.getLatestEventForSensorOfResident(subscription.sensorId, residentData);
      if (latestEvent) {
        qualities.push(latestEvent.qualityValue);
      }
    });

    if (qualities.length === 0) return 'N/A';
    
    if (activeSubscriptions.length === 1) {
      return this.translateQualityValue(qualities[0]); // Si solo hay un sensor, mostrar su valor exacto traducido
    }
    // Para múltiples sensores, calcular promedio
    return this.translateQualityValue(this.getAverageQualityForResident(residentData));
  }

  // Obtener nivel promedio actual de todos los sensores activos
  getCurrentLevelSummary(residentData: ResidentSensorData): string {
    const activeSubscriptions = this.getActiveSubscriptions(residentData);
    if (activeSubscriptions.length === 0) return 'N/A';

    const levels: number[] = [];
    activeSubscriptions.forEach(subscription => {
      const latestEvent = this.getLatestEventForSensorOfResident(subscription.sensorId, residentData);
      if (latestEvent) {
        const levelValue = typeof latestEvent.levelValue === 'string' ? 
          parseFloat(latestEvent.levelValue) : latestEvent.levelValue;
        if (!isNaN(levelValue)) {
          levels.push(levelValue);
        }
      }
    });

    if (levels.length === 0) return 'N/A';
    
    if (activeSubscriptions.length === 1) {
      return `${levels[0]}%`; // Si solo hay un sensor, mostrar su valor exacto
    }

    // Para múltiples sensores, calcular promedio
    const averageLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
    return `${Math.round(averageLevel)}%`;
  }

  // Obtener clase CSS para el nivel promedio
  getAverageLevelClass(residentData: ResidentSensorData): string {
    const levelSummary = this.getCurrentLevelSummary(residentData);
    if (levelSummary === 'N/A') return '';
    
    const levelValue = parseFloat(levelSummary.replace('%', ''));
    return this.getLevelClass(levelValue.toString());
  }

  // Traducir valores de calidad del agua
  translateQualityValue(quality: string): string {
    if (!quality) return 'N/A';
    
    const qualityLower = quality.toLowerCase().trim();
    switch (qualityLower) {
      case 'excelente':
        return this.translate('quality_excellent');
      case 'aceptable':
        return this.translate('quality_acceptable');
      case 'no potable':
        return this.translate('quality_not_potable');
      case 'no hay agua':
        return this.translate('quality_no_water');
      case 'error tds':
        return this.translate('quality_tds_error');
      case 'agua contaminada':
        return this.translate('quality_contaminated_water');
      default:
        return quality; // Mantener valor original si no se reconoce
    }
  }
}
